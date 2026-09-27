package com.kidstube.service;

import com.kidstube.domain.dto.request.RecordWatchHistoryRequest;
import com.kidstube.domain.dto.response.WatchHistoryItemResponse;
import com.kidstube.domain.dto.response.WatchHistorySummaryResponse;
import com.kidstube.domain.entity.Video;
import com.kidstube.domain.entity.WatchHistory;
import com.kidstube.exception.ResourceNotFoundException;
import com.kidstube.repository.VideoRepository;
import com.kidstube.repository.WatchHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WatchHistoryServiceTest {

    @Mock
    private WatchHistoryRepository watchHistoryRepository;

    @Mock
    private VideoRepository videoRepository;

    private final Clock clock = Clock.fixed(Instant.parse("2026-09-28T10:00:00Z"), ZoneId.of("UTC"));
    private WatchHistoryService watchHistoryService;

    @BeforeEach
    void setUp() {
        watchHistoryService = new WatchHistoryService(watchHistoryRepository, videoRepository, clock);
    }

    @Test
    @DisplayName("recordWatchHistory: Should record history when video exists")
    void recordWatchHistory_success() {
        Video video = Video.builder()
            .id(1L)
            .youtubeVideoId("xyz123")
            .title("Bé Học Chữ Cái")
            .thumbnailUrl("https://example.com/thumb.jpg")
            .build();

        when(videoRepository.findById(1L)).thenReturn(Optional.of(video));
        when(watchHistoryRepository.save(any(WatchHistory.class))).thenAnswer(invocation -> {
            WatchHistory entity = invocation.getArgument(0);
            entity.setId(100L);
            return entity;
        });

        RecordWatchHistoryRequest request = new RecordWatchHistoryRequest(1L, 180);
        WatchHistoryItemResponse response = watchHistoryService.recordWatchHistory(request);

        assertThat(response.id()).isEqualTo(100L);
        assertThat(response.videoId()).isEqualTo(1L);
        assertThat(response.videoTitle()).isEqualTo("Bé Học Chữ Cái");
        assertThat(response.youtubeVideoId()).isEqualTo("xyz123");
        assertThat(response.watchedSeconds()).isEqualTo(180);
        assertThat(response.watchedAt()).isEqualTo(OffsetDateTime.now(clock));
        verify(watchHistoryRepository).save(any(WatchHistory.class));
    }

    @Test
    @DisplayName("recordWatchHistory: Should throw ResourceNotFoundException when video does not exist")
    void recordWatchHistory_videoNotFound() {
        when(videoRepository.findById(999L)).thenReturn(Optional.empty());

        RecordWatchHistoryRequest request = new RecordWatchHistoryRequest(999L, 120);

        assertThatThrownBy(() -> watchHistoryService.recordWatchHistory(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Video not found with id: 999");
    }

    @Test
    @DisplayName("getHistorySummary: Should compute total time today and map recent activities")
    void getHistorySummary_success() {
        Video video = Video.builder()
            .id(1L)
            .youtubeVideoId("xyz123")
            .title("Bé Học Chữ Cái")
            .thumbnailUrl("https://example.com/thumb.jpg")
            .build();

        WatchHistory history = WatchHistory.builder()
            .id(10L)
            .video(video)
            .watchedSeconds(300)
            .watchedAt(OffsetDateTime.now(clock))
            .build();

        when(watchHistoryRepository.findTotalWatchedSecondsSince(any(OffsetDateTime.class))).thenReturn(1500);
        when(watchHistoryRepository.findRecentWithVideo(any(Pageable.class))).thenReturn(List.of(history));

        WatchHistorySummaryResponse summary = watchHistoryService.getHistorySummary(10);

        assertThat(summary.todayTotalWatchedSeconds()).isEqualTo(1500);
        assertThat(summary.todayTotalWatchedMinutes()).isEqualTo(25); // 1500 / 60
        assertThat(summary.recentActivities()).hasSize(1);
        assertThat(summary.recentActivities().get(0).videoTitle()).isEqualTo("Bé Học Chữ Cái");
    }
}
