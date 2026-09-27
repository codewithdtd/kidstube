package com.kidstube.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kidstube.domain.dto.request.ImportVideoRequest;
import com.kidstube.domain.dto.request.UpdateVideoRequest;
import com.kidstube.domain.entity.Video;
import com.kidstube.repository.VideoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class VideoControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VideoRepository videoRepository;

    @Test
    @DisplayName("GET /api/v1/categories - Trả về danh sách danh mục và số lượng video")
    void shouldReturnCategoriesWithVideoCount() throws Exception {
        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$[0].name", notNullValue()))
                .andExpect(jsonPath("$[0].videoCount", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/v1/videos - Trả về danh sách video khả dụng cho trẻ em")
    void shouldReturnActiveVideosForKid() throws Exception {
        mockMvc.perform(get("/api/v1/videos"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].youtubeVideoId", notNullValue()))
                .andExpect(jsonPath("$[0].isActive", is(true)));
    }

    @Test
    @DisplayName("GET /api/v1/videos?categoryId=1 - Lọc video theo danh mục")
    void shouldFilterVideosByCategory() throws Exception {
        mockMvc.perform(get("/api/v1/videos").param("categoryId", "1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /api/v1/parent/videos - Trả về toàn bộ video cho phụ huynh quản lý")
    void shouldReturnAllVideosForParent() throws Exception {
        mockMvc.perform(get("/api/v1/parent/videos"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST /api/v1/parent/videos/import - Báo lỗi RFC 7807 400 khi thiếu thông tin bắt buộc")
    void shouldReturnProblemDetailsWhenImportValidationFails() throws Exception {
        ImportVideoRequest invalidRequest = new ImportVideoRequest("", null);

        mockMvc.perform(post("/api/v1/parent/videos/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title", is("Validation Failed")))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.validationErrors.url", notNullValue()))
                .andExpect(jsonPath("$.validationErrors.categoryId", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/parent/videos/import - Báo lỗi RFC 7807 404 khi categoryId không tồn tại")
    void shouldReturn404WhenCategoryNotFoundForImport() throws Exception {
        ImportVideoRequest request = new ImportVideoRequest("https://www.youtube.com/watch?v=dQw4w9WgXcQ", 999999L);

        mockMvc.perform(post("/api/v1/parent/videos/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title", is("Resource Not Found")))
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    @DisplayName("PATCH /api/v1/parent/videos/{id} - Phụ huynh ẩn/hiện video thành công")
    void shouldUpdateVideoStatus() throws Exception {
        Video sampleVideo = videoRepository.findAll().get(0);

        UpdateVideoRequest updateRequest = new UpdateVideoRequest(false, null);

        mockMvc.perform(patch("/api/v1/parent/videos/" + sampleVideo.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(sampleVideo.getId().intValue())))
                .andExpect(jsonPath("$.isActive", is(false)));
    }

    @Test
    @DisplayName("DELETE /api/v1/parent/videos/{id} - Phụ huynh xóa video thành công (204 No Content)")
    void shouldDeleteVideoSuccessfully() throws Exception {
        Video sampleVideo = videoRepository.findAll().get(0);

        mockMvc.perform(delete("/api/v1/parent/videos/" + sampleVideo.getId()))
                .andExpect(status().isNoContent());

        // Verify video is deleted
        mockMvc.perform(delete("/api/v1/parent/videos/" + sampleVideo.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title", is("Resource Not Found")));
    }

}
