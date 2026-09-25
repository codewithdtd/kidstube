package com.kidstube.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.Objects;

@Entity
@Table(name = "watch_histories")
public class WatchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Column(name = "watched_seconds", nullable = false)
    private Integer watchedSeconds;

    @Column(name = "watched_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime watchedAt;

    public WatchHistory() {
    }

    public WatchHistory(Long id, Video video, Integer watchedSeconds, OffsetDateTime watchedAt) {
        this.id = id;
        this.video = video;
        this.watchedSeconds = watchedSeconds;
        this.watchedAt = watchedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Video getVideo() {
        return video;
    }

    public void setVideo(Video video) {
        this.video = video;
    }

    public Integer getWatchedSeconds() {
        return watchedSeconds;
    }

    public void setWatchedSeconds(Integer watchedSeconds) {
        this.watchedSeconds = watchedSeconds;
    }

    public OffsetDateTime getWatchedAt() {
        return watchedAt;
    }

    public void setWatchedAt(OffsetDateTime watchedAt) {
        this.watchedAt = watchedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Video video;
        private Integer watchedSeconds;
        private OffsetDateTime watchedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder video(Video video) {
            this.video = video;
            return this;
        }

        public Builder watchedSeconds(Integer watchedSeconds) {
            this.watchedSeconds = watchedSeconds;
            return this;
        }

        public Builder watchedAt(OffsetDateTime watchedAt) {
            this.watchedAt = watchedAt;
            return this;
        }

        public WatchHistory build() {
            return new WatchHistory(id, video, watchedSeconds, watchedAt);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof WatchHistory other)) return false;
        return id != null && Objects.equals(id, other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

