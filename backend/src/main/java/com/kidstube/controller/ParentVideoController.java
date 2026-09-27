package com.kidstube.controller;

import com.kidstube.domain.dto.request.ImportVideoRequest;
import com.kidstube.domain.dto.request.UpdateVideoRequest;
import com.kidstube.domain.dto.response.ImportResultResponse;
import com.kidstube.domain.dto.response.VideoResponse;
import com.kidstube.service.VideoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parent/videos")
public class ParentVideoController {

    private final VideoService videoService;

    public ParentVideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping
    public ResponseEntity<List<VideoResponse>> getAllVideosForParent(
            @RequestParam(required = false) Long categoryId
    ) {
        return ResponseEntity.ok(videoService.getAllVideosForParent(categoryId));
    }

    @PostMapping("/import")
    public ResponseEntity<ImportResultResponse> importVideo(@Valid @RequestBody ImportVideoRequest request) {
        ImportResultResponse response = videoService.importFromUrl(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<VideoResponse> updateVideo(
            @PathVariable Long id,
            @RequestBody UpdateVideoRequest request
    ) {
        return ResponseEntity.ok(videoService.updateVideo(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long id) {
        videoService.deleteVideo(id);
        return ResponseEntity.noContent().build();
    }
}
