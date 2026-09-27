package com.kidstube.controller;

import com.kidstube.domain.dto.request.ImportVideoRequest;
import com.kidstube.domain.dto.request.UpdateVideoRequest;
import com.kidstube.domain.dto.response.ImportResultResponse;
import com.kidstube.domain.dto.response.VideoResponse;
import com.kidstube.service.VideoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parent/videos")
@Tag(name = "3. Parent Video Management", description = "APIs for Parent portal to import, manage, and edit videos")
public class ParentVideoController {

    private final VideoService videoService;

    public ParentVideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping
    @Operation(summary = "Get all videos for Parent", description = "Returns all videos (both active and inactive) with optional category filter")
    public ResponseEntity<List<VideoResponse>> getAllVideosForParent(
            @Parameter(description = "Optional category ID filter") @RequestParam(required = false) Long categoryId
    ) {
        return ResponseEntity.ok(videoService.getAllVideosForParent(categoryId));
    }

    @PostMapping("/import")
    @Operation(summary = "Import video from YouTube URL", description = "Supports single YouTube video URL (oEmbed) or Channel URL (RSS feed)")
    public ResponseEntity<ImportResultResponse> importVideo(@Valid @RequestBody ImportVideoRequest request) {
        ImportResultResponse response = videoService.importFromUrl(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update video metadata or status", description = "Update title, category, or active status (toggle visibility)")
    public ResponseEntity<VideoResponse> updateVideo(
            @Parameter(description = "Video ID") @PathVariable Long id,
            @RequestBody UpdateVideoRequest request
    ) {
        return ResponseEntity.ok(videoService.updateVideo(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete video", description = "Permanently removes video from database")
    public ResponseEntity<Void> deleteVideo(@Parameter(description = "Video ID") @PathVariable Long id) {
        videoService.deleteVideo(id);
        return ResponseEntity.noContent().build();
    }
}

