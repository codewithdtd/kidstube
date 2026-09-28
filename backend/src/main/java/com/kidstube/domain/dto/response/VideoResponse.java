package com.kidstube.domain.dto.response;

import java.time.OffsetDateTime;

public record VideoResponse(
        Long id,
        String youtubeVideoId,
        String title,
        String thumbnailUrl,
        Integer durationSeconds,
        Long categoryId,
        String categoryName,
        String channelTitle,
        Boolean isActive,
        OffsetDateTime createdAt,
        Boolean isShort
) {
    public VideoResponse(Long id, String youtubeVideoId, String title, String thumbnailUrl,
                         Integer durationSeconds, Long categoryId, String categoryName,
                         String channelTitle, Boolean isActive, OffsetDateTime createdAt) {
        this(id, youtubeVideoId, title, thumbnailUrl, durationSeconds, categoryId, categoryName, channelTitle, isActive, createdAt, false);
    }
}


