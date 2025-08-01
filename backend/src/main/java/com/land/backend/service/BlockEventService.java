package com.land.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Network;
import org.hyperledger.fabric.sdk.BlockEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

@Service
public class BlockEventService {

    private final Gateway fabricGateway;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    // The listener registration handle, used to unregister the listener on shutdown
    private Consumer<BlockEvent> listenerRegistration;

    @Autowired
    public BlockEventService(Gateway fabricGateway, SimpMessagingTemplate messagingTemplate) {
        this.fabricGateway = fabricGateway;
        this.messagingTemplate = messagingTemplate;
    }

    @PostConstruct
    private void listenForBlocks() {
        try {
            Network network = fabricGateway.getNetwork("landchannel");

            // THE FIX IS HERE: We use a lambda Consumer function, which is the correct API
            this.listenerRegistration = network.addBlockListener(blockEvent -> {
                try {
                    long blockNumber = blockEvent.getBlockNumber();
                    System.out.println("✅ Received new block event: " + blockNumber);

                    // Send the new block information to all subscribed WebSocket clients
                    messagingTemplate.convertAndSend("/topic/new-blocks", Map.of(
                            "blockNumber", blockNumber,
                            // Note: The SDK BlockEvent does not directly expose a simple timestamp.
                            // We are sending the block number for the real-time update.
                            // The client can then make a REST call to get full block details if needed.
                            "message", "New block committed to the ledger."
                    ));
                } catch (Exception e) {
                    System.err.println("Error processing block event: " + e.getMessage());
                }
            });

            System.out.println("✅ Block event listener registered successfully.");

        } catch (Exception e) {
            System.err.println("FATAL: Could not register block listener: " + e.getMessage());
        }
    }

    @PreDestroy
    private void cleanup() {
        // Unregister the listener when the application shuts down
        if (listenerRegistration != null) {
            fabricGateway.getNetwork("landchannel").removeBlockListener(listenerRegistration);
        }
    }
}