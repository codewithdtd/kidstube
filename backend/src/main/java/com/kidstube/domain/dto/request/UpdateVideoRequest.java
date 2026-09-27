package com.kidstube.domain.dto.request;

public record UpdateVideoRequest(
        Boolean isActive,
        Long categoryId
) {}
