package com.kidstube.domain.dto.response;

import com.kidstube.domain.entity.WatchHistory;

import java.time.OffsetDateTime;

public record WatchHistoryItemResponse(
    Long id,
    Long videoId,
    String videoTitle,
    String youtubeVideoId,
    String thumbnailUrl,
    Integer watchedSeconds,
    OffsetDateTime watchedAt
) {
    public static WatchHistoryItemResponse fromEntity(WatchHistory entity) {
        String videoTitle = entity.getVideo() != null ? entity.getVideo().getTitle() : null;
        String youtubeVideoId = entity.getVideo() != null ? entity.getVideo().getYoutubeVideoId() : null;
        String thumbnailUrl = entity.getVideo() != null ? entity.getVideo().getThumbnailUrl() : null;
        Long videoId = entity.getVideo() != null ? entity.getVideo().getId() : null;

        return new WatchHistoryItemResponse(
            entity.getId(),
            videoId,
            videoTitle,
            youtubeVideoId,
            thumbnailUrl,
            entity.getWatchedSeconds(),
            entity.getWatchedAt()
        );
    }
}
