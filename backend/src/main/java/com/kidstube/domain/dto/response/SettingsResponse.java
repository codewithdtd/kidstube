package com.kidstube.domain.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kidstube.domain.entity.AppSetting;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

public record SettingsResponse(
    Integer dailyTimeLimitMinutes,
    String bedtimeStart,
    String bedtimeEnd,
    Boolean isLocked,
    String uiMode,
    OffsetDateTime updatedAt
) {
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public SettingsResponse(Integer dailyTimeLimitMinutes, String bedtimeStart, String bedtimeEnd, Boolean isLocked, OffsetDateTime updatedAt) {
        this(dailyTimeLimitMinutes, bedtimeStart, bedtimeEnd, isLocked, "KIDS_WORLD", updatedAt);
    }

    @JsonProperty("dailyLimitMinutes")
    public Integer getDailyLimitMinutes() {
        return dailyTimeLimitMinutes;
    }

    public static SettingsResponse fromEntity(AppSetting entity) {
        return new SettingsResponse(
            entity.getDailyTimeLimitMinutes(),
            entity.getBedtimeStart() != null ? entity.getBedtimeStart().format(TIME_FORMATTER) : "21:00",
            entity.getBedtimeEnd() != null ? entity.getBedtimeEnd().format(TIME_FORMATTER) : "07:00",
            entity.getIsLocked() != null ? entity.getIsLocked() : false,
            entity.getUiMode() != null ? entity.getUiMode() : "KIDS_WORLD",
            entity.getUpdatedAt()
        );
    }
}

