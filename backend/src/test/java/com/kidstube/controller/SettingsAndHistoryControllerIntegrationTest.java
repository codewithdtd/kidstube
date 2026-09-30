package com.kidstube.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kidstube.domain.dto.request.RecordWatchHistoryRequest;
import com.kidstube.domain.dto.request.SettingsRequest;
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

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SettingsAndHistoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VideoRepository videoRepository;

    @Test
    @DisplayName("GET /api/v1/parent/settings should return current family settings")
    void getSettings_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/parent/settings"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.dailyTimeLimitMinutes", notNullValue()))
            .andExpect(jsonPath("$.bedtimeStart", notNullValue()))
            .andExpect(jsonPath("$.bedtimeEnd", notNullValue()))
            .andExpect(jsonPath("$.isLocked", notNullValue()))
            .andExpect(jsonPath("$.uiMode", notNullValue()));
    }

    @Test
    @DisplayName("PUT /api/v1/parent/settings should update and return 200")
    void updateSettings_shouldReturn200() throws Exception {
        SettingsRequest request = new SettingsRequest(60, "21:30", "06:30", false);

        mockMvc.perform(put("/api/v1/parent/settings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.dailyTimeLimitMinutes", is(60)))
            .andExpect(jsonPath("$.bedtimeStart", is("21:30")))
            .andExpect(jsonPath("$.bedtimeEnd", is("06:30")))
            .andExpect(jsonPath("$.isLocked", is(false)));
    }

    @Test
    @DisplayName("PUT /api/v1/parent/settings using dailyLimitMinutes alias should update and return 200")
    void updateSettings_usingDailyLimitMinutesAlias_shouldReturn200() throws Exception {
        String jsonPayload = """
            {
                "dailyLimitMinutes": 90,
                "bedtimeStart": "20:30",
                "bedtimeEnd": "06:30",
                "isLocked": true
            }
            """;

        mockMvc.perform(put("/api/v1/parent/settings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.dailyTimeLimitMinutes", is(90)))
            .andExpect(jsonPath("$.dailyLimitMinutes", is(90)))
            .andExpect(jsonPath("$.bedtimeStart", is("20:30")))
            .andExpect(jsonPath("$.bedtimeEnd", is("06:30")))
            .andExpect(jsonPath("$.isLocked", is(true)));
    }

    @Test
    @DisplayName("PUT /api/v1/parent/settings with seconds in bedtime format should update and return 200")
    void updateSettings_withSecondsInBedtime_shouldReturn200() throws Exception {
        String jsonPayload = """
            {
                "dailyTimeLimitMinutes": 45,
                "bedtimeStart": "21:15:00",
                "bedtimeEnd": "07:45:00",
                "isLocked": false
            }
            """;

        mockMvc.perform(put("/api/v1/parent/settings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.dailyTimeLimitMinutes", is(45)))
            .andExpect(jsonPath("$.bedtimeStart", is("21:15")))
            .andExpect(jsonPath("$.bedtimeEnd", is("07:45")))
            .andExpect(jsonPath("$.isLocked", is(false)));
    }


    @Test
    @DisplayName("PATCH /api/v1/parent/settings/lock should toggle lock status and return 200")
    void toggleLock_shouldReturn200() throws Exception {
        mockMvc.perform(patch("/api/v1/parent/settings/lock")
                .param("isLocked", "true"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.isLocked", is(true)));

        mockMvc.perform(patch("/api/v1/parent/settings/lock")
                .param("isLocked", "false"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.isLocked", is(false)));
    }

    @Test
    @DisplayName("PATCH /api/v1/parent/settings/ui-mode should toggle UI mode and return 200")
    void updateUiMode_shouldReturn200() throws Exception {
        mockMvc.perform(patch("/api/v1/parent/settings/ui-mode")
                .param("uiMode", "YOUTUBE"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.uiMode", is("YOUTUBE")));

        mockMvc.perform(patch("/api/v1/parent/settings/ui-mode")
                .param("uiMode", "KIDS_WORLD"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.uiMode", is("KIDS_WORLD")));
    }


    @Test
    @DisplayName("PUT /api/v1/parent/settings with invalid time format should return 400 RFC 7807")
    void updateSettings_invalidTimeFormat_shouldReturn400() throws Exception {
        SettingsRequest request = new SettingsRequest(60, "25:99", "06:30", false);

        mockMvc.perform(put("/api/v1/parent/settings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status", is(400)))
            .andExpect(jsonPath("$.title", is("Validation Failed")))
            .andExpect(jsonPath("$.validationErrors.bedtimeStart", notNullValue()));
    }

    @Test
    @DisplayName("PUT /api/v1/parent/settings with dailyTimeLimit < 5 should return 400 RFC 7807")
    void updateSettings_timeLimitBelowMin_shouldReturn400() throws Exception {
        SettingsRequest request = new SettingsRequest(2, "21:00", "07:00", false);

        mockMvc.perform(put("/api/v1/parent/settings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status", is(400)))
            .andExpect(jsonPath("$.title", is("Validation Failed")))
            .andExpect(jsonPath("$.validationErrors.dailyTimeLimitMinutes", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/v1/status should return current status for kid app")
    void getStatus_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/status"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.isAllowed", notNullValue()))
            .andExpect(jsonPath("$.remainingSeconds", greaterThanOrEqualTo(0)))
            .andExpect(jsonPath("$.dailyLimitMinutes", greaterThanOrEqualTo(5)))
            .andExpect(jsonPath("$.message", notNullValue()))
            .andExpect(jsonPath("$.uiMode", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/history should record watch history and return 201")
    void recordHistory_shouldReturn201() throws Exception {
        Video video = videoRepository.findAll().stream().findFirst()
            .orElseGet(() -> {
                Video newVideo = Video.builder()
                    .youtubeVideoId("int_test_v1")
                    .title("Integration Video")
                    .thumbnailUrl("https://example.com/thumb.jpg")
                    .isActive(true)
                    .build();
                return videoRepository.save(newVideo);
            });

        RecordWatchHistoryRequest request = new RecordWatchHistoryRequest(video.getId(), 240);

        mockMvc.perform(post("/api/v1/history")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", notNullValue()))
            .andExpect(jsonPath("$.videoId", is(video.getId().intValue())))
            .andExpect(jsonPath("$.watchedSeconds", is(240)))
            .andExpect(jsonPath("$.videoTitle", is(video.getTitle())));
    }

    @Test
    @DisplayName("POST /api/v1/history with non-existent videoId should return 404 RFC 7807")
    void recordHistory_nonExistentVideo_shouldReturn404() throws Exception {
        RecordWatchHistoryRequest request = new RecordWatchHistoryRequest(999999L, 120);

        mockMvc.perform(post("/api/v1/history")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status", is(404)))
            .andExpect(jsonPath("$.title", is("Resource Not Found")));
    }

    @Test
    @DisplayName("POST /api/v1/history with watchedSeconds = 0 should return 400 RFC 7807")
    void recordHistory_invalidSeconds_shouldReturn400() throws Exception {
        RecordWatchHistoryRequest request = new RecordWatchHistoryRequest(1L, 0);

        mockMvc.perform(post("/api/v1/history")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status", is(400)))
            .andExpect(jsonPath("$.title", is("Validation Failed")))
            .andExpect(jsonPath("$.validationErrors.watchedSeconds", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/v1/parent/history should return history summary with 200")
    void getParentHistory_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/parent/history?limit=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.todayTotalWatchedSeconds", greaterThanOrEqualTo(0)))
            .andExpect(jsonPath("$.todayTotalWatchedMinutes", greaterThanOrEqualTo(0)))
            .andExpect(jsonPath("$.recentActivities", notNullValue()));
    }

}
