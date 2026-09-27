package com.kidstube.controller;

import com.kidstube.domain.dto.response.VideoResponse;
import com.kidstube.service.VideoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/videos")
@Tag(name = "2. Kid Videos Feed", description = "Safe video feed for Kid app")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping
    @Operation(summary = "Get video feed for kid", description = "Returns active videos optionally filtered by categoryId")
    public ResponseEntity<List<VideoResponse>> getVideosForKid(
            @Parameter(description = "Optional category ID filter") @RequestParam(required = false) Long categoryId
    ) {
        return ResponseEntity.ok(videoService.getVideosForKid(categoryId));
    }
}

