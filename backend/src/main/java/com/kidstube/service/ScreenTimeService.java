package com.kidstube.service;

import com.kidstube.domain.dto.response.AppStatusResponse;
import com.kidstube.domain.entity.AppSetting;
import com.kidstube.repository.AppSettingRepository;
import com.kidstube.repository.WatchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;

@Service
public class ScreenTimeService {

    private final AppSettingRepository appSettingRepository;
    private final WatchHistoryRepository watchHistoryRepository;
    private final Clock clock;

    @Autowired
    public ScreenTimeService(AppSettingRepository appSettingRepository, WatchHistoryRepository watchHistoryRepository) {
        this(appSettingRepository, watchHistoryRepository, Clock.systemDefaultZone());
    }

    public ScreenTimeService(AppSettingRepository appSettingRepository,
                             WatchHistoryRepository watchHistoryRepository,
                             Clock clock) {
        this.appSettingRepository = appSettingRepository;
        this.watchHistoryRepository = watchHistoryRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public AppStatusResponse checkCurrentStatus() {
        AppSetting setting = appSettingRepository.findById(AppSettingsService.DEFAULT_SETTINGS_ID)
            .orElseGet(() -> AppSetting.builder()
                .id(AppSettingsService.DEFAULT_SETTINGS_ID)
                .dailyTimeLimitMinutes(45)
                .bedtimeStart(LocalTime.of(21, 0))
                .bedtimeEnd(LocalTime.of(7, 0))
                .isLocked(false)
                .build());

        LocalDate today = LocalDate.now(clock);
        ZonedDateTime startOfDayZoned = today.atStartOfDay(clock.getZone());
        OffsetDateTime startOfDay = startOfDayZoned.toOffsetDateTime();

        Integer totalUsedSecondsNullable = watchHistoryRepository.findTotalWatchedSecondsSince(startOfDay);
        int todayUsedSeconds = totalUsedSecondsNullable != null ? totalUsedSecondsNullable : 0;

        int dailyLimitMinutes = setting.getDailyTimeLimitMinutes() != null ? setting.getDailyTimeLimitMinutes() : 45;
        int dailyLimitSeconds = dailyLimitMinutes * 60;
        int remainingSeconds = Math.max(0, dailyLimitSeconds - todayUsedSeconds);

        LocalTime now = LocalTime.now(clock);
        boolean isBedtime = isBedtime(now, setting.getBedtimeStart(), setting.getBedtimeEnd());
        boolean isLocked = Boolean.TRUE.equals(setting.getIsLocked());

        boolean isAllowed = true;
        String lockReason = null;
        String message = "Bé có thể xem video vui vẻ!";

        if (isLocked) {
            isAllowed = false;
            lockReason = "MANUAL_LOCK";
            message = "Ứng dụng đang tạm thời được ba mẹ khóa.";
        } else if (isBedtime) {
            isAllowed = false;
            lockReason = "BEDTIME";
            message = "Đã đến giờ đi ngủ rồi, bé hãy nghỉ ngơi nhé!";
        } else if (remainingSeconds <= 0) {
            isAllowed = false;
            lockReason = "TIME_LIMIT_EXCEEDED";
            message = "Hôm nay bé đã xem hết thời gian cho phép rồi. Hẹn gặp lại bé vào ngày mai nhé!";
        }

        return new AppStatusResponse(
            isAllowed,
            remainingSeconds,
            dailyLimitMinutes,
            todayUsedSeconds,
            isLocked,
            isBedtime,
            lockReason,
            message,
            setting.getUiMode() != null ? setting.getUiMode() : "KIDS_WORLD"
        );
    }

    public boolean isBedtime(LocalTime now, LocalTime start, LocalTime end) {
        if (start == null || end == null || start.equals(end)) {
            return false;
        }
        if (start.isBefore(end)) {
            return !now.isBefore(start) && now.isBefore(end);
        } else {
            return !now.isBefore(start) || now.isBefore(end);
        }
    }
}
