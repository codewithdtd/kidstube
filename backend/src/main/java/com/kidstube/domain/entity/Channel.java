package com.kidstube.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.Objects;

@Entity
@Table(name = "channels")
public class Channel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "youtube_channel_id", nullable = false, unique = true, length = 64)
    private String youtubeChannelId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "custom_url", length = 255)
    private String customUrl;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    public Channel() {
    }

    public Channel(Long id, String youtubeChannelId, String title, String customUrl, String thumbnailUrl, OffsetDateTime createdAt) {
        this.id = id;
        this.youtubeChannelId = youtubeChannelId;
        this.title = title;
        this.customUrl = customUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getYoutubeChannelId() {
        return youtubeChannelId;
    }

    public void setYoutubeChannelId(String youtubeChannelId) {
        this.youtubeChannelId = youtubeChannelId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCustomUrl() {
        return customUrl;
    }

    public void setCustomUrl(String customUrl) {
        this.customUrl = customUrl;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
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
        private String youtubeChannelId;
        private String title;
        private String customUrl;
        private String thumbnailUrl;
        private OffsetDateTime createdAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder youtubeChannelId(String youtubeChannelId) {
            this.youtubeChannelId = youtubeChannelId;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder customUrl(String customUrl) {
            this.customUrl = customUrl;
            return this;
        }

        public Builder thumbnailUrl(String thumbnailUrl) {
            this.thumbnailUrl = thumbnailUrl;
            return this;
        }

        public Builder createdAt(OffsetDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Channel build() {
            return new Channel(id, youtubeChannelId, title, customUrl, thumbnailUrl, createdAt);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Channel other)) return false;
        return Objects.equals(youtubeChannelId, other.youtubeChannelId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(youtubeChannelId);
    }
}

