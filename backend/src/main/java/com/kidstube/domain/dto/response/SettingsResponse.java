package com.kidstube.domain.dto.response;

import com.kidstube.domain.entity.AppSetting;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

public record SettingsResponse(
    Integer dailyTimeLimitMinutes,
    String bedtimeStart,
    String bedtimeEnd,
    Boolean isLocked,
    OffsetDateTime updatedAt
) {
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public static SettingsResponse fromEntity(AppSetting entity) {
        return new SettingsResponse(
            entity.getDailyTimeLimitMinutes(),
            entity.getBedtimeStart() != null ? entity.getBedtimeStart().format(TIME_FORMATTER) : "21:00",
            entity.getBedtimeEnd() != null ? entity.getBedtimeEnd().format(TIME_FORMATTER) : "07:00",
            entity.getIsLocked() != null ? entity.getIsLocked() : false,
            entity.getUpdatedAt()
        );
    }
}
