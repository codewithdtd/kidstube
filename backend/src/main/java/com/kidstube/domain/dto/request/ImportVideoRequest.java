package com.kidstube.domain.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu nạp video từ YouTube URL")
public record ImportVideoRequest(
        @NotBlank(message = "URL YouTube không được để trống")
        @Schema(description = "Đường dẫn video hoặc kênh YouTube", example = "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        String url,

        @Schema(description = "ID danh mục (tùy chọn - nếu bỏ trống hệ thống sẽ tự động gán danh mục ngẫu nhiên)", example = "1", nullable = true)
        Long categoryId,

        @Schema(description = "Chỉ nạp video ngắn Shorts (khi nạp theo kênh)", example = "true", nullable = true)
        Boolean shortsOnly
) {
    public ImportVideoRequest(String url, Long categoryId) {
        this(url, categoryId, false);
    }
}


