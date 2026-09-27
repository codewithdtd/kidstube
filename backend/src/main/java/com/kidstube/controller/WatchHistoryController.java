package com.kidstube.controller;

import com.kidstube.domain.dto.request.RecordWatchHistoryRequest;
import com.kidstube.domain.dto.response.WatchHistoryItemResponse;
import com.kidstube.domain.dto.response.WatchHistorySummaryResponse;
import com.kidstube.service.WatchHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "5. Watch History", description = "Watch session recording (Kid) & activity analytics (Parent)")
public class WatchHistoryController {

    private final WatchHistoryService watchHistoryService;

    public WatchHistoryController(WatchHistoryService watchHistoryService) {
        this.watchHistoryService = watchHistoryService;
    }

    @PostMapping("/history")
    @Operation(summary = "Record video watch duration", description = "Called by Kid app periodically or when finishing a video to deduct daily quota")
    public ResponseEntity<WatchHistoryItemResponse> recordHistory(@Valid @RequestBody RecordWatchHistoryRequest request) {
        WatchHistoryItemResponse response = watchHistoryService.recordWatchHistory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/parent/history")
    @Operation(summary = "Get watch history summary & recent logs", description = "Returns today's total watched time and recent watch history entries for Parent portal")
    public ResponseEntity<WatchHistorySummaryResponse> getParentHistorySummary(
        @Parameter(description = "Max number of recent activities to return (default 20)") @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(watchHistoryService.getHistorySummary(limit));
    }
}

