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
        OffsetDateTime createdAt
) {}

