package com.kidstube.controller;

import com.kidstube.domain.dto.response.VideoResponse;
import com.kidstube.service.VideoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/videos")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping
    public ResponseEntity<List<VideoResponse>> getVideosForKid(
            @RequestParam(required = false) Long categoryId
    ) {
        return ResponseEntity.ok(videoService.getVideosForKid(categoryId));
    }
}
