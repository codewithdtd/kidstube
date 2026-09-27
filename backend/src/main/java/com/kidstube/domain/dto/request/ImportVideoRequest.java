package com.kidstube.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ImportVideoRequest(
        @NotBlank(message = "URL YouTube không được để trống")
        String url,

        @NotNull(message = "Danh mục không được để trống")
        Long categoryId
) {}
