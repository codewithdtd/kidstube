package com.kidstube.service.youtube;

import java.util.List;

public record YouTubeChannelFeed(
        String channelId,
        String channelTitle,
        String channelUrl,
        List<YouTubeVideoMetadata> videos
) {}
