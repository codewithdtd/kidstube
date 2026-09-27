package com.kidstube.domain.dto.response;

import java.util.List;

public record ImportResultResponse(
        String importType,
        String channelTitle,
        int importedCount,
        List<VideoResponse> videos,
        String message
) {}
