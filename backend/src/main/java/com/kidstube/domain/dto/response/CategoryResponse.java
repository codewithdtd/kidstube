package com.kidstube.domain.dto.response;

public record CategoryResponse(
        Long id,
        String name,
        String iconUrl,
        Integer displayOrder,
        Long videoCount
) {}
