package com.kidstube.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.Objects;

@Entity
@Table(name = "app_settings")
public class AppSetting {

    @Id
    private Integer id;

    @Column(name = "daily_time_limit_minutes")
    private Integer dailyTimeLimitMinutes;

    @Column(name = "bedtime_start")
    private LocalTime bedtimeStart;

    @Column(name = "bedtime_end")
    private LocalTime bedtimeEnd;

    @Column(name = "is_locked")
    private Boolean isLocked;

    @Column(name = "ui_mode", length = 30)
    private String uiMode;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    public AppSetting() {
    }

    public AppSetting(Integer id, Integer dailyTimeLimitMinutes, LocalTime bedtimeStart, LocalTime bedtimeEnd,
                      Boolean isLocked, OffsetDateTime updatedAt) {
        this(id, dailyTimeLimitMinutes, bedtimeStart, bedtimeEnd, isLocked, "KIDS_WORLD", updatedAt);
    }

    public AppSetting(Integer id, Integer dailyTimeLimitMinutes, LocalTime bedtimeStart, LocalTime bedtimeEnd,
                      Boolean isLocked, String uiMode, OffsetDateTime updatedAt) {
        this.id = id;
        this.dailyTimeLimitMinutes = dailyTimeLimitMinutes;
        this.bedtimeStart = bedtimeStart;
        this.bedtimeEnd = bedtimeEnd;
        this.isLocked = isLocked;
        this.uiMode = (uiMode != null && !uiMode.isBlank()) ? uiMode : "KIDS_WORLD";
        this.updatedAt = updatedAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getDailyTimeLimitMinutes() {
        return dailyTimeLimitMinutes;
    }

    public void setDailyTimeLimitMinutes(Integer dailyTimeLimitMinutes) {
        this.dailyTimeLimitMinutes = dailyTimeLimitMinutes;
    }

    public LocalTime getBedtimeStart() {
        return bedtimeStart;
    }

    public void setBedtimeStart(LocalTime bedtimeStart) {
        this.bedtimeStart = bedtimeStart;
    }

    public LocalTime getBedtimeEnd() {
        return bedtimeEnd;
    }

    public void setBedtimeEnd(LocalTime bedtimeEnd) {
        this.bedtimeEnd = bedtimeEnd;
    }

    public Boolean getIsLocked() {
        return isLocked;
    }

    public void setIsLocked(Boolean isLocked) {
        this.isLocked = isLocked;
    }

    public String getUiMode() {
        return uiMode;
    }

    public void setUiMode(String uiMode) {
        this.uiMode = uiMode;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Integer id;
        private Integer dailyTimeLimitMinutes;
        private LocalTime bedtimeStart;
        private LocalTime bedtimeEnd;
        private Boolean isLocked;
        private String uiMode = "KIDS_WORLD";
        private OffsetDateTime updatedAt;

        public Builder id(Integer id) {
            this.id = id;
            return this;
        }

        public Builder dailyTimeLimitMinutes(Integer dailyTimeLimitMinutes) {
            this.dailyTimeLimitMinutes = dailyTimeLimitMinutes;
            return this;
        }

        public Builder bedtimeStart(LocalTime bedtimeStart) {
            this.bedtimeStart = bedtimeStart;
            return this;
        }

        public Builder bedtimeEnd(LocalTime bedtimeEnd) {
            this.bedtimeEnd = bedtimeEnd;
            return this;
        }

        public Builder isLocked(Boolean isLocked) {
            this.isLocked = isLocked;
            return this;
        }

        public Builder uiMode(String uiMode) {
            this.uiMode = uiMode;
            return this;
        }

        public Builder updatedAt(OffsetDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public AppSetting build() {
            return new AppSetting(id, dailyTimeLimitMinutes, bedtimeStart, bedtimeEnd, isLocked, uiMode, updatedAt);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AppSetting other)) return false;
        return Objects.equals(id, other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

