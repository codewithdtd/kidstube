package com.kidstube.service.youtube;

public record YouTubeParsedUrl(
        ParsedType type,
        String identifier
) {
    public enum ParsedType {
        SINGLE_VIDEO,
        CHANNEL_ID,
        CHANNEL_HANDLE,
        CHANNEL_CUSTOM
    }
}
