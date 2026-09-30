package com.kidstube.repository;

import com.kidstube.domain.entity.AppSetting;
import com.kidstube.domain.entity.Category;
import com.kidstube.domain.entity.Channel;
import com.kidstube.domain.entity.Video;
import com.kidstube.domain.entity.WatchHistory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class FlywaySchemaAndDataTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private AppSettingRepository appSettingRepository;

    @Autowired
    private WatchHistoryRepository watchHistoryRepository;

    @Test
    @DisplayName("Flyway V2 should have seeded exactly 4 categories ordered by displayOrder")
    void shouldVerifySeededCategories() {
        List<Category> categories = categoryRepository.findAllByOrderByDisplayOrderAsc();

        assertThat(categories).hasSize(4);
        assertThat(categories.get(0).getName()).isEqualTo("Hoạt hình vui nhộn");
        assertThat(categories.get(1).getName()).isEqualTo("Ca nhạc thiếu nhi");
        assertThat(categories.get(2).getName()).isEqualTo("Khám phá & Khoa học");
        assertThat(categories.get(3).getName()).isEqualTo("Bé học Tiếng Anh");
    }

    @Test
    @DisplayName("Flyway V2 should have seeded default AppSetting singleton with 45 minutes limit")
    void shouldVerifyDefaultAppSetting() {
        Optional<AppSetting> settingOpt = appSettingRepository.findById(1);

        assertThat(settingOpt).isPresent();
        AppSetting setting = settingOpt.get();
        assertThat(setting.getDailyTimeLimitMinutes()).isEqualTo(45);
        assertThat(setting.getBedtimeStart()).isEqualTo(LocalTime.of(21, 0, 0));
        assertThat(setting.getBedtimeEnd()).isEqualTo(LocalTime.of(7, 0, 0));
        assertThat(setting.getIsLocked()).isFalse();
        assertThat(setting.getUiMode()).isEqualTo("KIDS_WORLD");
    }

    @Test
    @DisplayName("Flyway V2 & V3 should have seeded sample channel, curated videos and shorts")
    void shouldVerifySampleChannelAndVideos() {
        Optional<Channel> channelOpt = channelRepository.findByYoutubeChannelId("UCbCmjCuTUZos62Q4gtHW4wQ");
        assertThat(channelOpt).isPresent();
        assertThat(channelOpt.get().getTitle()).contains("CoComelon");

        List<Video> activeVideos = videoRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        assertThat(activeVideos).hasSize(7);

        List<Video> shorts = videoRepository.findActiveShortsWithDetails();
        assertThat(shorts).hasSize(3);
        assertThat(shorts).allMatch(v -> Boolean.TRUE.equals(v.getIsShort()));

        boolean exists = videoRepository.existsByYoutubeVideoId("WRVsOCh907o");
        assertThat(exists).isTrue();
    }

    @Test
    @Transactional
    @DisplayName("Should save and retrieve watch history linked to an existing video")
    void shouldSaveAndQueryWatchHistory() {
        Video sampleVideo = videoRepository.findByYoutubeVideoId("WRVsOCh907o")
                .orElseThrow(() -> new IllegalStateException("Sample video not found"));

        WatchHistory history = WatchHistory.builder()
                .video(sampleVideo)
                .watchedSeconds(180)
                .watchedAt(OffsetDateTime.now())
                .build();

        WatchHistory saved = watchHistoryRepository.save(history);
        assertThat(saved.getId()).isNotNull();

        List<WatchHistory> histories = watchHistoryRepository.findAllByOrderByWatchedAtDesc();
        assertThat(histories).isNotEmpty();
        assertThat(histories.get(0).getVideo().getYoutubeVideoId()).isEqualTo("WRVsOCh907o");
    }
}
