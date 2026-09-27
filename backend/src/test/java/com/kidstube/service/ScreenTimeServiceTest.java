package com.kidstube.service;

import com.kidstube.domain.dto.response.AppStatusResponse;
import com.kidstube.domain.entity.AppSetting;
import com.kidstube.repository.AppSettingRepository;
import com.kidstube.repository.WatchHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScreenTimeServiceTest {

    @Mock
    private AppSettingRepository appSettingRepository;

    @Mock
    private WatchHistoryRepository watchHistoryRepository;

    private final ZoneId zoneId = ZoneId.of("UTC");

    @Nested
    @DisplayName("Bedtime Calculation Tests")
    class BedtimeTests {

        private ScreenTimeService service;

        @BeforeEach
        void setUp() {
            service = new ScreenTimeService(appSettingRepository, watchHistoryRepository);
        }

        @Test
        @DisplayName("Overnight Bedtime: 21:30 should be inside bedtime (21:00 to 07:00)")
        void overnightBedtime_atLateNight() {
            LocalTime start = LocalTime.of(21, 0);
            LocalTime end = LocalTime.of(7, 0);
            LocalTime now = LocalTime.of(21, 30);
            assertThat(service.isBedtime(now, start, end)).isTrue();
        }

        @Test
        @DisplayName("Overnight Bedtime: 05:00 should be inside bedtime (21:00 to 07:00)")
        void overnightBedtime_atEarlyMorning() {
            LocalTime start = LocalTime.of(21, 0);
            LocalTime end = LocalTime.of(7, 0);
            LocalTime now = LocalTime.of(5, 0);
            assertThat(service.isBedtime(now, start, end)).isTrue();
        }

        @Test
        @DisplayName("Overnight Bedtime: 07:00 exact boundary should NOT be bedtime")
        void overnightBedtime_atWakeUpTime() {
            LocalTime start = LocalTime.of(21, 0);
            LocalTime end = LocalTime.of(7, 0);
            LocalTime now = LocalTime.of(7, 0);
            assertThat(service.isBedtime(now, start, end)).isFalse();
        }

        @Test
        @DisplayName("Overnight Bedtime: 14:00 daytime should NOT be bedtime")
        void overnightBedtime_atDaytime() {
            LocalTime start = LocalTime.of(21, 0);
            LocalTime end = LocalTime.of(7, 0);
            LocalTime now = LocalTime.of(14, 0);
            assertThat(service.isBedtime(now, start, end)).isFalse();
        }

        @Test
        @DisplayName("Daytime Bedtime: 14:00 should be inside bedtime (13:00 to 15:00)")
        void daytimeBedtime_insideWindow() {
            LocalTime start = LocalTime.of(13, 0);
            LocalTime end = LocalTime.of(15, 0);
            LocalTime now = LocalTime.of(14, 0);
            assertThat(service.isBedtime(now, start, end)).isTrue();
        }

        @Test
        @DisplayName("Daytime Bedtime: 12:00 should NOT be bedtime (13:00 to 15:00)")
        void daytimeBedtime_outsideWindow() {
            LocalTime start = LocalTime.of(13, 0);
            LocalTime end = LocalTime.of(15, 0);
            LocalTime now = LocalTime.of(12, 0);
            assertThat(service.isBedtime(now, start, end)).isFalse();
        }

        @Test
        @DisplayName("Equal start and end time should return false")
        void equalTimes_shouldReturnFalse() {
            LocalTime time = LocalTime.of(21, 0);
            assertThat(service.isBedtime(time, time, time)).isFalse();
        }

        @Test
        @DisplayName("Null times should return false")
        void nullTimes_shouldReturnFalse() {
            assertThat(service.isBedtime(LocalTime.now(), null, null)).isFalse();
        }
    }

    @Nested
    @DisplayName("Status Evaluation Tests")
    class StatusEvaluationTests {

        @Test
        @DisplayName("Should block with MANUAL_LOCK when isLocked is true")
        void whenLocked_shouldReturnManualLock() {
            Clock clock = Clock.fixed(Instant.parse("2026-09-28T10:00:00Z"), zoneId);
            ScreenTimeService service = new ScreenTimeService(appSettingRepository, watchHistoryRepository, clock);

            AppSetting setting = AppSetting.builder()
                .id(1)
                .dailyTimeLimitMinutes(45)
                .bedtimeStart(LocalTime.of(21, 0))
                .bedtimeEnd(LocalTime.of(7, 0))
                .isLocked(true)
                .build();

            when(appSettingRepository.findById(1)).thenReturn(Optional.of(setting));
            when(watchHistoryRepository.findTotalWatchedSecondsSince(any(OffsetDateTime.class))).thenReturn(0);

            AppStatusResponse status = service.checkCurrentStatus();

            assertThat(status.isAllowed()).isFalse();
            assertThat(status.lockReason()).isEqualTo("MANUAL_LOCK");
            assertThat(status.isLocked()).isTrue();
        }

        @Test
        @DisplayName("Should block with BEDTIME when currently inside bedtime")
        void whenInBedtime_shouldReturnBedtimeLock() {
            Clock clock = Clock.fixed(Instant.parse("2026-09-28T22:30:00Z"), zoneId);
            ScreenTimeService service = new ScreenTimeService(appSettingRepository, watchHistoryRepository, clock);

            AppSetting setting = AppSetting.builder()
                .id(1)
                .dailyTimeLimitMinutes(45)
                .bedtimeStart(LocalTime.of(21, 0))
                .bedtimeEnd(LocalTime.of(7, 0))
                .isLocked(false)
                .build();

            when(appSettingRepository.findById(1)).thenReturn(Optional.of(setting));
            when(watchHistoryRepository.findTotalWatchedSecondsSince(any(OffsetDateTime.class))).thenReturn(0);

            AppStatusResponse status = service.checkCurrentStatus();

            assertThat(status.isAllowed()).isFalse();
            assertThat(status.lockReason()).isEqualTo("BEDTIME");
            assertThat(status.isBedtime()).isTrue();
        }

        @Test
        @DisplayName("Should block with TIME_LIMIT_EXCEEDED when daily limit is exhausted")
        void whenLimitExceeded_shouldReturnTimeLimitExceeded() {
            Clock clock = Clock.fixed(Instant.parse("2026-09-28T10:00:00Z"), zoneId);
            ScreenTimeService service = new ScreenTimeService(appSettingRepository, watchHistoryRepository, clock);

            AppSetting setting = AppSetting.builder()
                .id(1)
                .dailyTimeLimitMinutes(30)
                .bedtimeStart(LocalTime.of(21, 0))
                .bedtimeEnd(LocalTime.of(7, 0))
                .isLocked(false)
                .build();

            when(appSettingRepository.findById(1)).thenReturn(Optional.of(setting));
            when(watchHistoryRepository.findTotalWatchedSecondsSince(any(OffsetDateTime.class))).thenReturn(1850);

            AppStatusResponse status = service.checkCurrentStatus();

            assertThat(status.isAllowed()).isFalse();
            assertThat(status.lockReason()).isEqualTo("TIME_LIMIT_EXCEEDED");
            assertThat(status.remainingSeconds()).isZero();
            assertThat(status.todayUsedSeconds()).isEqualTo(1850);
        }

        @Test
        @DisplayName("Should allow viewing when within limit and outside bedtime")
        void whenValid_shouldAllowViewing() {
            Clock clock = Clock.fixed(Instant.parse("2026-09-28T10:00:00Z"), zoneId);
            ScreenTimeService service = new ScreenTimeService(appSettingRepository, watchHistoryRepository, clock);

            AppSetting setting = AppSetting.builder()
                .id(1)
                .dailyTimeLimitMinutes(45)
                .bedtimeStart(LocalTime.of(21, 0))
                .bedtimeEnd(LocalTime.of(7, 0))
                .isLocked(false)
                .build();

            when(appSettingRepository.findById(1)).thenReturn(Optional.of(setting));
            when(watchHistoryRepository.findTotalWatchedSecondsSince(any(OffsetDateTime.class))).thenReturn(700);

            AppStatusResponse status = service.checkCurrentStatus();

            assertThat(status.isAllowed()).isTrue();
            assertThat(status.lockReason()).isNull();
            assertThat(status.remainingSeconds()).isEqualTo(2000);
            assertThat(status.todayUsedSeconds()).isEqualTo(700);
            assertThat(status.dailyLimitMinutes()).isEqualTo(45);
        }
    }

}
