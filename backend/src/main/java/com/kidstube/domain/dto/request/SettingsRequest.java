package com.kidstube.domain.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record SettingsRequest(
    @NotNull(message = "Daily time limit is required")
    @Min(value = 5, message = "Daily time limit must be at least 5 minutes")
    @Max(value = 360, message = "Daily time limit cannot exceed 360 minutes (6 hours)")
    @JsonAlias({"dailyLimitMinutes"})
    Integer dailyTimeLimitMinutes,

    @NotBlank(message = "Bedtime start is required")
    @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$", message = "Bedtime start must be in HH:mm or HH:mm:ss format")
    String bedtimeStart,

    @NotBlank(message = "Bedtime end is required")
    @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$", message = "Bedtime end must be in HH:mm or HH:mm:ss format")
    String bedtimeEnd,

    @NotNull(message = "isLocked is required")
    Boolean isLocked
) {
}

