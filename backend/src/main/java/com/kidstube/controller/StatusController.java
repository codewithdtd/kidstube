package com.kidstube.controller;

import com.kidstube.domain.dto.response.AppStatusResponse;
import com.kidstube.service.ScreenTimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/status")
@Tag(name = "4. Kid App Status", description = "Screen time heartbeat & viewing permission check for Kid app")
public class StatusController {

    private final ScreenTimeService screenTimeService;

    public StatusController(ScreenTimeService screenTimeService) {
        this.screenTimeService = screenTimeService;
    }

    @GetMapping
    @Operation(summary = "Check kid app permission & screen time", description = "Returns whether the child is allowed to watch, remaining seconds, bedtime status, or lock reason")
    public ResponseEntity<AppStatusResponse> getStatus() {
        return ResponseEntity.ok(screenTimeService.checkCurrentStatus());
    }
}

