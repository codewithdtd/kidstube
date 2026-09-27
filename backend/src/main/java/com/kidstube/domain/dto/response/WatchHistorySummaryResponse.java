package com.kidstube.domain.dto.response;

import java.util.List;

public record WatchHistorySummaryResponse(
    int todayTotalWatchedSeconds,
    int todayTotalWatchedMinutes,
    List<WatchHistoryItemResponse> recentActivities
) {
}
