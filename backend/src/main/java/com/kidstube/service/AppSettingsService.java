package com.kidstube.service;

import com.kidstube.domain.dto.request.SettingsRequest;
import com.kidstube.domain.dto.response.SettingsResponse;
import com.kidstube.domain.entity.AppSetting;
import com.kidstube.repository.AppSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.OffsetDateTime;

@Service
public class AppSettingsService {

    public static final int DEFAULT_SETTINGS_ID = 1;
    private final AppSettingRepository appSettingRepository;

    public AppSettingsService(AppSettingRepository appSettingRepository) {
        this.appSettingRepository = appSettingRepository;
    }

    @Transactional(readOnly = true)
    public SettingsResponse getSettings() {
        AppSetting setting = getOrCreateSettings();
        return SettingsResponse.fromEntity(setting);
    }

    @Transactional
    public SettingsResponse updateSettings(SettingsRequest request) {
        AppSetting setting = getOrCreateSettings();
        setting.setDailyTimeLimitMinutes(request.dailyTimeLimitMinutes());
        setting.setBedtimeStart(LocalTime.parse(request.bedtimeStart()));
        setting.setBedtimeEnd(LocalTime.parse(request.bedtimeEnd()));
        setting.setIsLocked(request.isLocked());
        setting.setUpdatedAt(OffsetDateTime.now());

        AppSetting saved = appSettingRepository.save(setting);
        return SettingsResponse.fromEntity(saved);
    }

    @Transactional
    public AppSetting getOrCreateSettings() {
        return appSettingRepository.findById(DEFAULT_SETTINGS_ID)
            .orElseGet(() -> {
                AppSetting defaultSetting = AppSetting.builder()
                    .id(DEFAULT_SETTINGS_ID)
                    .dailyTimeLimitMinutes(45)
                    .bedtimeStart(LocalTime.of(21, 0))
                    .bedtimeEnd(LocalTime.of(7, 0))
                    .isLocked(false)
                    .updatedAt(OffsetDateTime.now())
                    .build();
                return appSettingRepository.save(defaultSetting);
            });
    }
}
