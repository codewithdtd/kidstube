package com.kidstube.controller;

import com.kidstube.domain.dto.request.SettingsRequest;
import com.kidstube.domain.dto.response.SettingsResponse;
import com.kidstube.service.AppSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/parent/settings")
@Tag(name = "6. Parent Settings", description = "Parental controls: daily limit, bedtime, and instant lock")
public class ParentSettingsController {

    private final AppSettingsService appSettingsService;

    public ParentSettingsController(AppSettingsService appSettingsService) {
        this.appSettingsService = appSettingsService;
    }

    @GetMapping
    @Operation(summary = "Get parental settings", description = "Retrieves current daily limit minutes, bedtime start/end, and manual lock status")
    public ResponseEntity<SettingsResponse> getSettings() {
        return ResponseEntity.ok(appSettingsService.getSettings());
    }

    @PutMapping
    @Operation(summary = "Update parental settings", description = "Updates daily time limit (5-360 mins), bedtime (HH:mm), and manual lock switch")
    public ResponseEntity<SettingsResponse> updateSettings(@Valid @RequestBody SettingsRequest request) {
        return ResponseEntity.ok(appSettingsService.updateSettings(request));
    }

    @PatchMapping("/lock")
    @Operation(summary = "Toggle instant lock", description = "One-click toggle to lock or unlock the kid app immediately without modifying other settings")
    public ResponseEntity<SettingsResponse> toggleLock(@RequestParam boolean isLocked) {
        return ResponseEntity.ok(appSettingsService.toggleLock(isLocked));
    }

    @PatchMapping("/ui-mode")
    @Operation(summary = "Update active UI mode", description = "Switch between YOUTUBE clone and KIDS_WORLD custom playful wonderland theme")
    public ResponseEntity<SettingsResponse> updateUiMode(@RequestParam String uiMode) {
        return ResponseEntity.ok(appSettingsService.updateUiMode(uiMode));
    }

}

