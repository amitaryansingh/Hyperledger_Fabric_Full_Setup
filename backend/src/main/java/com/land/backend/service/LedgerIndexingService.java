package com.land.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
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
            // 1. Use the ExplorerService to fetch the full, decoded block JSON.
            JsonNode blockJson = explorerService.getBlockByNumber(blockNumber);

            // 2. Create and populate the Block entity from the rich JSON.
            Block block = new Block();
            block.setBlockNumber(blockNumber);
            block.setDataHash(blockJson.at("/header/data_hash").asText());
            block.setPreviousHash(blockJson.at("/header/previous_hash").asText());
            // Safely get timestamp from the first transaction in the block
            if (blockJson.at("/data/data/0/payload/header/channel_header/timestamp").isTextual()) {
                block.setTimestamp(Instant.parse(blockJson.at("/data/data/0/payload/header/channel_header/timestamp").asText()));
            }
            block.setTransactions(new ArrayList<>());

            // 3. Iterate through transactions in the block's JSON data.
            JsonNode transactionsArray = blockJson.at("/data/data");
            if (transactionsArray.isArray()) {
                for (JsonNode txNode : transactionsArray) {
                    JsonNode header = txNode.at("/payload/header/channel_header");
                    JsonNode creator = txNode.at("/payload/header/signature_header/creator");

                    Transaction transaction = new Transaction();
                    transaction.setTransactionId(header.at("/tx_id").asText());
                    transaction.setCreatorMspId(creator.at("/mspid").asText());
                    // This logic can be expanded later to parse chaincode args
                    transaction.setChaincodeName("landcc"); // Placeholder

                    transaction.setBlock(block);
                    block.getTransactions().add(transaction);
                }
            }

            // 4. Save the fully parsed block to the database.
            blockRepository.save(block);
            System.out.println("✅ Indexed and saved block #" + block.getBlockNumber() + " with " + block.getTransactions().size() + " transactions.");

            // 5. Send a real-time notification to the frontend.
            messagingTemplate.convertAndSend("/topic/new-blocks", Map.of(
                    "blockNumber", block.getBlockNumber(),
                    "txCount", block.getTransactions().size()
            ));

        } catch (Exception e) {
            System.err.println("❌ Error processing block event for block #" + blockNumber + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}