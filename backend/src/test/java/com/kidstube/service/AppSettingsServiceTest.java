package com.kidstube.service;

import com.kidstube.domain.dto.request.SettingsRequest;
import com.kidstube.domain.dto.response.SettingsResponse;
import com.kidstube.domain.entity.AppSetting;
import com.kidstube.repository.AppSettingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppSettingsServiceTest {

    @Mock
    private AppSettingRepository appSettingRepository;

    @InjectMocks
    private AppSettingsService appSettingsService;

    @Test
    @DisplayName("getSettings: Should return existing settings")
    void getSettings_existing() {
        AppSetting setting = AppSetting.builder()
            .id(1)
            .dailyTimeLimitMinutes(60)
            .bedtimeStart(LocalTime.of(21, 30))
            .bedtimeEnd(LocalTime.of(6, 30))
            .isLocked(false)
            .updatedAt(OffsetDateTime.now())
            .build();

        when(appSettingRepository.findById(1)).thenReturn(Optional.of(setting));

        SettingsResponse response = appSettingsService.getSettings();

        assertThat(response.dailyTimeLimitMinutes()).isEqualTo(60);
        assertThat(response.bedtimeStart()).isEqualTo("21:30");
        assertThat(response.bedtimeEnd()).isEqualTo("06:30");
        assertThat(response.isLocked()).isFalse();
    }

    @Test
    @DisplayName("getSettings: Should create default settings when none exists")
    void getSettings_notExisting_createsDefault() {
        when(appSettingRepository.findById(1)).thenReturn(Optional.empty());
        when(appSettingRepository.save(any(AppSetting.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SettingsResponse response = appSettingsService.getSettings();

        assertThat(response.dailyTimeLimitMinutes()).isEqualTo(45);
        assertThat(response.bedtimeStart()).isEqualTo("21:00");
        assertThat(response.bedtimeEnd()).isEqualTo("07:00");
        assertThat(response.isLocked()).isFalse();
        verify(appSettingRepository).save(any(AppSetting.class));
    }

    @Test
    @DisplayName("updateSettings: Should update all fields and save")
    void updateSettings_success() {
        AppSetting existing = AppSetting.builder()
            .id(1)
            .dailyTimeLimitMinutes(45)
            .bedtimeStart(LocalTime.of(21, 0))
            .bedtimeEnd(LocalTime.of(7, 0))
            .isLocked(false)
            .build();

        when(appSettingRepository.findById(1)).thenReturn(Optional.of(existing));
        when(appSettingRepository.save(any(AppSetting.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SettingsRequest request = new SettingsRequest(90, "22:00", "08:00", true);
        SettingsResponse response = appSettingsService.updateSettings(request);

        assertThat(response.dailyTimeLimitMinutes()).isEqualTo(90);
        assertThat(response.bedtimeStart()).isEqualTo("22:00");
        assertThat(response.bedtimeEnd()).isEqualTo("08:00");
        assertThat(response.isLocked()).isTrue();
        verify(appSettingRepository).save(existing);
    }

    @Test
    @DisplayName("toggleLock: Should toggle isLocked status and save")
    void toggleLock_success() {
        AppSetting existing = AppSetting.builder()
            .id(1)
            .dailyTimeLimitMinutes(45)
            .bedtimeStart(LocalTime.of(21, 0))
            .bedtimeEnd(LocalTime.of(7, 0))
            .isLocked(false)
            .build();

        when(appSettingRepository.findById(1)).thenReturn(Optional.of(existing));
        when(appSettingRepository.save(any(AppSetting.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SettingsResponse response = appSettingsService.toggleLock(true);

        assertThat(response.isLocked()).isTrue();
        assertThat(response.dailyTimeLimitMinutes()).isEqualTo(45);
        verify(appSettingRepository).save(existing);
    }

    @Test
    @DisplayName("updateUiMode: Should update uiMode and save")
    void updateUiMode_success() {
        AppSetting existing = AppSetting.builder()
            .id(1)
            .dailyTimeLimitMinutes(45)
            .bedtimeStart(LocalTime.of(21, 0))
            .bedtimeEnd(LocalTime.of(7, 0))
            .isLocked(false)
            .uiMode("KIDS_WORLD")
            .build();

        when(appSettingRepository.findById(1)).thenReturn(Optional.of(existing));
        when(appSettingRepository.save(any(AppSetting.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SettingsResponse response = appSettingsService.updateUiMode("YOUTUBE");

        assertThat(response.uiMode()).isEqualTo("YOUTUBE");
        verify(appSettingRepository).save(existing);
    }

    @Test
    @DisplayName("parseTime: Should parse HH:mm, HH:mm:ss, and H:mm formats correctly")
    void parseTime_flexibleFormats() {
        assertThat(AppSettingsService.parseTime("21:30")).isEqualTo(LocalTime.of(21, 30));
        assertThat(AppSettingsService.parseTime("21:30:45")).isEqualTo(LocalTime.of(21, 30, 45));
        assertThat(AppSettingsService.parseTime("7:00")).isEqualTo(LocalTime.of(7, 0));
        assertThat(AppSettingsService.parseTime("07:00:00")).isEqualTo(LocalTime.of(7, 0, 0));
        assertThat(AppSettingsService.parseTime("")).isEqualTo(LocalTime.of(0, 0));
        assertThat(AppSettingsService.parseTime(null)).isEqualTo(LocalTime.of(0, 0));
    }
}

