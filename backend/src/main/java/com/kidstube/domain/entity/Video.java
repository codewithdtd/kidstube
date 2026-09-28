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
@Table(name = "videos")
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "youtube_video_id", nullable = false, unique = true, length = 32)
    private String youtubeVideoId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id")
    private Channel channel;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "is_short")
    private Boolean isShort = false;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    public Video() {
    }

    public Video(Long id, String youtubeVideoId, String title, String thumbnailUrl, Integer durationSeconds,
                 Category category, Channel channel, Boolean isActive, OffsetDateTime createdAt) {
        this(id, youtubeVideoId, title, thumbnailUrl, durationSeconds, category, channel, isActive, createdAt, false);
    }

    public Video(Long id, String youtubeVideoId, String title, String thumbnailUrl, Integer durationSeconds,
                 Category category, Channel channel, Boolean isActive, OffsetDateTime createdAt, Boolean isShort) {
        this.id = id;
        this.youtubeVideoId = youtubeVideoId;
        this.title = title;
        this.thumbnailUrl = thumbnailUrl;
        this.durationSeconds = durationSeconds;
        this.category = category;
        this.channel = channel;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.isShort = isShort != null ? isShort : false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getYoutubeVideoId() {
        return youtubeVideoId;
    }

    public void setYoutubeVideoId(String youtubeVideoId) {
        this.youtubeVideoId = youtubeVideoId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Channel getChannel() {
        return channel;
    }

    public void setChannel(Channel channel) {
        this.channel = channel;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsShort() {
        return isShort;
    }

    public void setIsShort(Boolean isShort) {
        this.isShort = isShort != null ? isShort : false;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String youtubeVideoId;
        private String title;
        private String thumbnailUrl;
        private Integer durationSeconds;
        private Category category;
        private Channel channel;
        private Boolean isActive;
        private Boolean isShort = false;
        private OffsetDateTime createdAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder youtubeVideoId(String youtubeVideoId) {
            this.youtubeVideoId = youtubeVideoId;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder thumbnailUrl(String thumbnailUrl) {
            this.thumbnailUrl = thumbnailUrl;
            return this;
        }

        public Builder durationSeconds(Integer durationSeconds) {
            this.durationSeconds = durationSeconds;
            return this;
        }

        public Builder category(Category category) {
            this.category = category;
            return this;
        }

        public Builder channel(Channel channel) {
            this.channel = channel;
            return this;
        }

        public Builder isActive(Boolean isActive) {
            this.isActive = isActive;
            return this;
        }

        public Builder isShort(Boolean isShort) {
            this.isShort = isShort;
            return this;
        }

        public Builder createdAt(OffsetDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Video build() {
            return new Video(id, youtubeVideoId, title, thumbnailUrl, durationSeconds, category, channel, isActive, createdAt, isShort);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Video other)) return false;
        return Objects.equals(youtubeVideoId, other.youtubeVideoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(youtubeVideoId);
    }
}

