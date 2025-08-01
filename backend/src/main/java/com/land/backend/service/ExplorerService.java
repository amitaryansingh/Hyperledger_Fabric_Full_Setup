package com.land.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.land.backend.dto.BlockInfoDTO;
import com.land.backend.dto.TransactionInfoDTO;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Network;
import org.hyperledger.fabric.sdk.BlockInfo;
import org.hyperledger.fabric.sdk.Channel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExplorerService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Gateway fabricGateway;

    @Autowired
    public ExplorerService(Gateway fabricGateway) {
        this.fabricGateway = fabricGateway;
    }

    public long getBlockHeight() throws Exception {
        Network network = fabricGateway.getNetwork("landchannel");
        Channel channel = network.getChannel();
        return channel.queryBlockchainInfo().getHeight();
    }


    public BlockInfoDTO getBlockInfo(long blockNumber) throws Exception {
        Network network = fabricGateway.getNetwork("landchannel");
        Channel channel = network.getChannel();
        BlockInfo blockInfo = channel.queryBlockByNumber(blockNumber);

        BlockInfoDTO blockDto = new BlockInfoDTO();
        blockDto.setBlockNumber(blockInfo.getBlockNumber());
        blockDto.setDataHash(Base64.getEncoder().encodeToString(blockInfo.getDataHash()));
        blockDto.setPreviousHash(Base64.getEncoder().encodeToString(blockInfo.getPreviousHash()));

        List<TransactionInfoDTO> transactions = new ArrayList<>();

        for (BlockInfo.EnvelopeInfo envelopeInfo : blockInfo.getEnvelopeInfos()) {

            if (blockDto.getTimestamp() == null && envelopeInfo.getTimestamp() != null) {
                blockDto.setTimestamp(envelopeInfo.getTimestamp().toInstant());
            }

            if (!(envelopeInfo instanceof BlockInfo.TransactionEnvelopeInfo txEnvelope)) continue;

            for (BlockInfo.TransactionEnvelopeInfo.TransactionActionInfo actionInfo : txEnvelope.getTransactionActionInfos()) {
                TransactionInfoDTO txDto = new TransactionInfoDTO();
                txDto.setTransactionId(txEnvelope.getTransactionID());
                txDto.setTimestamp(txEnvelope.getTimestamp().toInstant());
                txDto.setCreatorMspId(txEnvelope.getCreator().getMspid());
                txDto.setChaincodeName(actionInfo.getChaincodeIDName());

                // Parse args: First = function, Rest = args
                List<String> argsList = new ArrayList<>();
                for (int i = 0; i < actionInfo.getChaincodeInputArgsCount(); i++) {
                    byte[] argBytes = actionInfo.getChaincodeInputArgs(i);
                    argsList.add(new String(argBytes, StandardCharsets.UTF_8));
                }

                if (!argsList.isEmpty()) {
                    txDto.setFunctionName(argsList.get(0));
                    if (argsList.size() > 1) {
                        txDto.setFunctionArgs(argsList.subList(1, argsList.size()));
                    } else {
                        txDto.setFunctionArgs(Collections.emptyList());
                    }
                } else {
                    txDto.setFunctionName("unknown");
                    txDto.setFunctionArgs(null);
                }

                transactions.add(txDto);
            }
        }

        blockDto.setTransactions(transactions);
        return blockDto;
    }


    public JsonNode getBlockByNumber(long blockNumber) throws Exception {
        // Use unique temp file for each request to avoid race conditions
        String tempBlockFile = String.format("/tmp/block_%d_%d.pb", blockNumber, System.currentTimeMillis());
        String command = String.format(
                "CORE_PEER_TLS_ENABLED=true CORE_PEER_LOCALMSPID='GovOrgMSP' CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls/ca.crt CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp CORE_PEER_ADDRESS=peer0.gov.land.com:7051 peer channel fetch %d %s -c landchannel --orderer orderer.land.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/ordererOrganizations/land.com/orderers/orderer.land.com/tls/ca.crt && configtxlator proto_decode --type common.Block --input %s",
                blockNumber, tempBlockFile, tempBlockFile
        );

        ProcessBuilder processBuilder = new ProcessBuilder("docker", "exec", "cli", "bash", "-c", command);
        Process process = processBuilder.start();
        String output;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            output = reader.lines().collect(Collectors.joining("\n"));
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String errorOutput = errorReader.lines().collect(Collectors.joining("\n"));
                throw new RuntimeException("Failed to fetch or decode block. Exit code: " + exitCode + ". Error: " + errorOutput);
            }
        }

        return objectMapper.readTree(output);
    }
}