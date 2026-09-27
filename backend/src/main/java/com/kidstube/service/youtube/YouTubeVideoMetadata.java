package com.kidstube.service.youtube;

public record YouTubeVideoMetadata(
        String videoId,
        String title,
        String authorName,
        String authorUrl,
        String thumbnailUrl,
        Integer durationSeconds
) {}
