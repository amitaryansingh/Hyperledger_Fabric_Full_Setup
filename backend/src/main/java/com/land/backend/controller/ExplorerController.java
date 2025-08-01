package com.land.backend.controller;

import com.land.backend.dto.BlockInfoDTO;
import com.land.backend.service.ExplorerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/explorer")
public class ExplorerController {

    private final ExplorerService explorerService;

    @Autowired
    public ExplorerController(ExplorerService explorerService) {
        this.explorerService = explorerService;
    }

    @GetMapping("/info")
    public ResponseEntity<?> getLedgerInfo() {
        try {
            long height = explorerService.getBlockHeight();
            return ResponseEntity.ok(Map.of("height", height));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting ledger info: " + e.getMessage());
        }
    }

    @GetMapping("/block/{blockNumber}")
    public ResponseEntity<?> getBlock(@PathVariable long blockNumber) {
        try {
            long currentHeight = explorerService.getBlockHeight();
            if (blockNumber >= currentHeight) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Block not found. The latest block is " + (currentHeight - 1) + ".");
            }

            BlockInfoDTO block = explorerService.getBlockInfo(blockNumber);
            return ResponseEntity.ok(block);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching block: " + e.getMessage());
        }
    }
}