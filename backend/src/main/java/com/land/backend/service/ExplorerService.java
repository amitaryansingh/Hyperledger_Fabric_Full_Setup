//package com.land.backend.service;
//
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.springframework.stereotype.Service;
//
//import java.io.BufferedReader;
//import java.io.InputStreamReader;
//import java.util.concurrent.TimeUnit;
//import java.util.stream.Collectors;
//
//@Service
//public class ExplorerService {
//
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    public long getBlockHeight() throws Exception {
//        String command = "bash -c 'CORE_PEER_TLS_ENABLED=true CORE_PEER_LOCALMSPID=\"GovOrgMSP\" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls/ca.crt CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp CORE_PEER_ADDRESS=peer0.gov.land.com:7051 peer channel getinfo -c landchannel -o orderer.land.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/ordererOrganizations/land.com/orderers/orderer.land.com/tls/ca.crt'";
//
//        ProcessBuilder processBuilder = new ProcessBuilder("docker", "exec", "cli", "bash", "-c", command);
//        processBuilder.redirectErrorStream(true);
//
//        Process process = processBuilder.start();
//        String output;
//        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
//            output = reader.lines().collect(Collectors.joining("\n"));
//        }
//
//        int exitCode = process.waitFor();
//        if (exitCode != 0) {
//            throw new RuntimeException("Failed to get channel info. Exit code: " + exitCode + ". Output: " + output);
//        }
//
//        String jsonPart = output.substring(output.indexOf('{'));
//        JsonNode jsonNode = objectMapper.readTree(jsonPart);
//        return jsonNode.get("height").asLong();
//    }
//
//    // --- THIS IS THE FIX for the null response ---
//    // This version uses a temporary file inside the container, which is more robust than piping.
//    public JsonNode getBlockByNumber(long blockNumber) throws Exception {
//        String tempBlockFile = "/tmp/block.pb";
//        String command = String.format(
//                "bash -c 'CORE_PEER_TLS_ENABLED=true CORE_PEER_LOCALMSPID=\"GovOrgMSP\" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/peers/peer0.gov.land.com/tls/ca.crt CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/peerOrganizations/gov.land.com/users/Admin@gov.land.com/msp CORE_PEER_ADDRESS=peer0.gov.land.com:7051 peer channel fetch %d %s -c landchannel --orderer orderer.land.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/fabric-network/crypto-config/ordererOrganizations/land.com/orderers/orderer.land.com/tls/ca.crt && configtxlator proto_decode --type common.Block --input %s'",
//                blockNumber, tempBlockFile, tempBlockFile
//        );
//
//        ProcessBuilder processBuilder = new ProcessBuilder("docker", "exec", "cli", "bash", "-c", command);
//
//        Process process = processBuilder.start();
//        String output;
//        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
//            output = reader.lines().collect(Collectors.joining("\n"));
//        }
//
//        int exitCode = process.waitFor();
//        if (exitCode != 0) {
//            throw new RuntimeException("Failed to fetch or decode block. Exit code: " + exitCode + ". Output: " + output);
//        }
//
//        return objectMapper.readTree(output);
//    }
//}


package com.land.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ExplorerService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonNode getBlockByNumber(long blockNumber) throws Exception {
        // This version uses a temporary file inside the container, which is more robust than piping.
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