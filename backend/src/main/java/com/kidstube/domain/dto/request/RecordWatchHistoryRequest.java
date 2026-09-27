package com.kidstube.domain.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RecordWatchHistoryRequest(
    @NotNull(message = "videoId is required")
    Long videoId,

    @NotNull(message = "watchedSeconds is required")
    @Min(value = 1, message = "watchedSeconds must be at least 1")
    @Max(value = 86400, message = "watchedSeconds cannot exceed 86400 (24 hours)")
    Integer watchedSeconds
) {
}
