package com.land.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.InvalidProtocolBufferException;
import com.land.backend.dto.BlockInfoDTO;
import com.land.backend.dto.TransactionInfoDTO;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Network;
import org.hyperledger.fabric.protos.peer.TransactionPackage;
import org.hyperledger.fabric.sdk.BlockInfo;
import org.hyperledger.fabric.sdk.Channel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
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
        JsonNode blockJson = getBlockByNumber(blockNumber);
        return parseBlockJsonToDto(blockJson);
    }

    private BlockInfoDTO parseBlockJsonToDto(JsonNode blockJson) {
        BlockInfoDTO blockInfoDTO = new BlockInfoDTO();
        JsonNode header = blockJson.path("header");
        blockInfoDTO.setBlockNumber(header.path("number").asLong());
        blockInfoDTO.setDataHash(header.path("data_hash").asText());
        blockInfoDTO.setPreviousHash(header.path("previous_hash").asText());

        List<TransactionInfoDTO> transactions = new ArrayList<>();
        JsonNode dataArray = blockJson.path("data").path("data");

        if (dataArray.isArray() && dataArray.size() > 0) {
            // Set block timestamp from the first transaction
            JsonNode firstTxHeader = dataArray.get(0).path("payload").path("header").path("channel_header");
            blockInfoDTO.setTimestamp(Instant.parse(firstTxHeader.path("timestamp").asText()));

            for (JsonNode txNode : dataArray) {
                TransactionInfoDTO txDto = new TransactionInfoDTO();
                JsonNode channelHeader = txNode.path("payload").path("header").path("channel_header");

                txDto.setTransactionId(channelHeader.path("tx_id").asText());
                txDto.setTimestamp(Instant.parse(channelHeader.path("timestamp").asText()));
                txDto.setCreatorMspId(txNode.path("payload").path("header").path("signature_header").path("creator").path("mspid").asText());

                try {
                    JsonNode actions = txNode.path("payload").path("data").path("actions");
                    if (actions.isArray() && actions.size() > 0) {
                        JsonNode payload = actions.get(0).path("payload");
                        JsonNode chaincodeProposalPayload = payload.path("chaincode_proposal_payload");

                        // Base64 decode to get human-readable input
                        String input = new String(Base64.getDecoder().decode(chaincodeProposalPayload.path("input").asText()));

                        // Clean the input string to remove non-printable characters
                        String cleanInput = input.replaceAll("[^\\x20-\\x7E]", "");

                        // Extract the function name, which is typically the first part of the clean input
                        String functionName = "unknown";
                        if (cleanInput.length() > 0) {
                            functionName = cleanInput.split("\\s+")[0];
                        }


                        txDto.setFunctionName(functionName);
                        txDto.setChaincodeName(payload.path("action").path("proposal_response_payload").path("extension").path("chaincode_id").path("name").asText());
                    } else {
                        txDto.setFunctionName("Config");
                    }
                } catch (Exception e) {
                    txDto.setFunctionName("Config or Endorsement");
                }
                transactions.add(txDto);
            }
        }
        blockInfoDTO.setTransactions(transactions);
        return blockInfoDTO;
    }

    public JsonNode getBlockByNumber(long blockNumber) throws Exception {
        String tempBlockFile = "/tmp/block.pb";
        String command = String.format(
                "bash -c 'CORE_PEER_TLS_ENABLED=true CORE_PEER_LOCALMSPID=\"GovOrgMSP\" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls/ca.crt CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp CORE_PEER_ADDRESS=peer0.gov.land.com:7051 peer channel fetch %d %s -c landchannel --orderer orderer.land.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/ordererOrganizations/land.com/orderers/orderer.land.com/tls/ca.crt && configtxlator proto_decode --type common.Block --input %s'",
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
            throw new RuntimeException("Failed to fetch or decode block. Exit code: " + exitCode + ". Output: " + output);
        }

        return objectMapper.readTree(output);
    }
}