package com.kidstube.domain.dto.response;

public record AppStatusResponse(
    boolean isAllowed,
    int remainingSeconds,
    int dailyLimitMinutes,
    int todayUsedSeconds,
    boolean isLocked,
    boolean isBedtime,
    String lockReason,
    String message,
    String uiMode
) {
    public AppStatusResponse(boolean isAllowed, int remainingSeconds, int dailyLimitMinutes,
                             int todayUsedSeconds, boolean isLocked, boolean isBedtime,
                             String lockReason, String message) {
        this(isAllowed, remainingSeconds, dailyLimitMinutes, todayUsedSeconds, isLocked, isBedtime, lockReason, message, "KIDS_WORLD");
    }
}

