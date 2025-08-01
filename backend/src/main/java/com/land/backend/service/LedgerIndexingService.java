package com.land.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.land.backend.dto.BlockInfoDTO;
import com.land.backend.dto.TransactionInfoDTO;
import com.land.backend.model.Block;
import com.land.backend.model.Transaction;
import com.land.backend.repository.BlockRepository;
import jakarta.annotation.PostConstruct;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Network;
import org.hyperledger.fabric.sdk.BlockEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Map;

@Service
public class LedgerIndexingService {

    private final Gateway fabricGateway;
    private final BlockRepository blockRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ExplorerService explorerService; // The service to fetch full block data

    @Autowired
    public LedgerIndexingService(Gateway fabricGateway, BlockRepository blockRepository, SimpMessagingTemplate messagingTemplate, ExplorerService explorerService) {
        this.fabricGateway = fabricGateway;
        this.blockRepository = blockRepository;
        this.messagingTemplate = messagingTemplate;
        this.explorerService = explorerService;
    }

    @PostConstruct
    public void startBlockListener() {
        try {
            Network network = fabricGateway.getNetwork("landchannel");
            // The listener provides a minimal BlockEvent, which we use as a trigger.
            network.addBlockListener(this::processBlockEventTrigger);
            System.out.println("✅ Ledger Indexing Service started and listening for new blocks.");
        } catch (Exception e) {
            System.err.println("❌ Failed to start block listener: " + e.getMessage());
        }
    }

    private void processBlockEventTrigger(BlockEvent blockEvent) {
        long blockNumber = blockEvent.getBlockNumber();
        System.out.println("✅ Received block event trigger for block: " + blockNumber);

        try {
            // 1. Use the ExplorerService to fetch and parse the full block.
            BlockInfoDTO blockInfo = explorerService.getBlockInfo(blockNumber);

            // 2. Create the Block entity for database persistence.
            Block block = new Block();
            block.setBlockNumber(blockInfo.getBlockNumber());
            block.setDataHash(blockInfo.getDataHash());
            block.setPreviousHash(blockInfo.getPreviousHash());
            block.setTimestamp(blockInfo.getTimestamp());
            block.setTransactions(new ArrayList<>());

            // 3. Create Transaction entities.
            if (blockInfo.getTransactions() != null) {
                for (TransactionInfoDTO txDto : blockInfo.getTransactions()) {
                    Transaction transaction = new Transaction();
                    transaction.setTransactionId(txDto.getTransactionId());
                    transaction.setCreatorMspId(txDto.getCreatorMspId());
                    transaction.setChaincodeName(txDto.getChaincodeName());
                    transaction.setFunctionName(txDto.getFunctionName());
                    transaction.setBlock(block);
                    block.getTransactions().add(transaction);
                }
            }

            // 4. Save the fully parsed block to the database.
            blockRepository.save(block);
            System.out.println("✅ Indexed and saved block #" + block.getBlockNumber() + " with " + block.getTransactions().size() + " transactions.");

            // 5. Send the rich BlockInfoDTO to the frontend via WebSocket.
            messagingTemplate.convertAndSend("/topic/new-blocks", blockInfo);

        } catch (Exception e) {
            System.err.println("❌ Error processing block event for block #" + blockNumber + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}