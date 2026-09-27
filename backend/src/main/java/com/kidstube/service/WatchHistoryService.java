package com.kidstube.service;

import com.kidstube.domain.dto.request.RecordWatchHistoryRequest;
import com.kidstube.domain.dto.response.WatchHistoryItemResponse;
import com.kidstube.domain.dto.response.WatchHistorySummaryResponse;
import com.kidstube.domain.entity.Video;
import com.kidstube.domain.entity.WatchHistory;
import com.kidstube.exception.ResourceNotFoundException;
import com.kidstube.repository.VideoRepository;
import com.kidstube.repository.WatchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.List;

@Service
public class WatchHistoryService {

    private final WatchHistoryRepository watchHistoryRepository;
    private final VideoRepository videoRepository;
    private final Clock clock;

    @Autowired
    public WatchHistoryService(WatchHistoryRepository watchHistoryRepository, VideoRepository videoRepository) {
        this(watchHistoryRepository, videoRepository, Clock.systemDefaultZone());
    }

    public WatchHistoryService(WatchHistoryRepository watchHistoryRepository,
                               VideoRepository videoRepository,
                               Clock clock) {
        this.watchHistoryRepository = watchHistoryRepository;
        this.videoRepository = videoRepository;
        this.clock = clock;
    }

    @Transactional
    public WatchHistoryItemResponse recordWatchHistory(RecordWatchHistoryRequest request) {
        Video video = videoRepository.findById(request.videoId())
            .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + request.videoId()));

        WatchHistory history = WatchHistory.builder()
            .video(video)
            .watchedSeconds(request.watchedSeconds())
            .watchedAt(OffsetDateTime.now(clock))
            .build();

        WatchHistory saved = watchHistoryRepository.save(history);
        return WatchHistoryItemResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public WatchHistorySummaryResponse getHistorySummary(int limit) {
        LocalDate today = LocalDate.now(clock);
        ZonedDateTime startOfDayZoned = today.atStartOfDay(clock.getZone());
        OffsetDateTime startOfDay = startOfDayZoned.toOffsetDateTime();

        Integer totalUsedSecondsNullable = watchHistoryRepository.findTotalWatchedSecondsSince(startOfDay);
        int todayTotalSeconds = totalUsedSecondsNullable != null ? totalUsedSecondsNullable : 0;
        int todayTotalMinutes = (int) Math.round((double) todayTotalSeconds / 60.0);

        int safeLimit = Math.min(Math.max(limit, 1), 100);
        List<WatchHistory> recentEntities = watchHistoryRepository.findRecentWithVideo(PageRequest.of(0, safeLimit));

        List<WatchHistoryItemResponse> items = recentEntities.stream()
            .map(WatchHistoryItemResponse::fromEntity)
            .toList();

        return new WatchHistorySummaryResponse(todayTotalSeconds, todayTotalMinutes, items);
    }
}
