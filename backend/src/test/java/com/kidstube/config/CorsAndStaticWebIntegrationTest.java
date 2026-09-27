package com.kidstube.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CorsAndStaticWebIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("CORS Preflight request to /api/** should return allowed headers and origins")
    void testCorsPreflightForApiEndpoints() throws Exception {
        mockMvc.perform(options("/api/v1/status")
                .header(HttpHeaders.ORIGIN, "http://localhost:3000")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000"))
                .andExpect(header().exists(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS));
    }

    @Test
    @DisplayName("Static Parent Portal index.html should be accessible with 200 OK")
    void testParentPortalIndexAccessible() throws Exception {
        mockMvc.perform(get("/parent/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Parent Portal")))
                .andExpect(content().string(containsString("tab-videos")));
    }

    @Test
    @DisplayName("Static Parent Portal app.js should be accessible with 200 OK")
    void testParentPortalAppJsAccessible() throws Exception {
        mockMvc.perform(get("/parent/app.js"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("loadVideos")));
    }

    @Test
    @DisplayName("Static Parent Portal index.html should contain search, filter, and preview modal elements")
    void testParentPortalIndexContainsSearchAndPreviewModal() throws Exception {
        mockMvc.perform(get("/parent/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("video-search-input")))
                .andExpect(content().string(containsString("filter-status-all")))
                .andExpect(content().string(containsString("preview-modal")));
    }

    @Test
    @DisplayName("Static Parent Portal app.js should contain search filter and video preview logic")
    void testParentPortalAppJsContainsFilterAndPreviewLogic() throws Exception {
        mockMvc.perform(get("/parent/app.js"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("getFilteredVideos")))
                .andExpect(content().string(containsString("openVideoPreview")))
                .andExpect(content().string(containsString("filterByStatus")));
    }

    @Test
    @DisplayName("Static Parent Portal index.html and app.js should contain screen time presets and emergency lock controls")
    void testParentPortalContainsScreenTimeAndLockControls() throws Exception {
        mockMvc.perform(get("/parent/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("btn-quick-toggle-lock")))
                .andExpect(content().string(containsString("setLimitPreset")))
                .andExpect(content().string(containsString("setBedtimePreset")))
                .andExpect(content().string(containsString("history-count-badge")));

        mockMvc.perform(get("/parent/app.js"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("toggleQuickLock")))
                .andExpect(content().string(containsString("toggleLockApi")))
                .andExpect(content().string(containsString("setLimitPreset")))
                .andExpect(content().string(containsString("setBedtimePreset")));
    }

    @Test
    @DisplayName("Root index.html redirect should be accessible")
    void testRootIndexAccessible() throws Exception {
        mockMvc.perform(get("/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("/parent/index.html")));
    }

    @Test
    @DisplayName("Parent portal routes /parent and /parent/ should forward to /parent/index.html")
    void testParentPortalRouteAliases() throws Exception {
        mockMvc.perform(get("/parent"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/parent/index.html"));

        mockMvc.perform(get("/parent/"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/parent/index.html"));

        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/parent/index.html"));
    }
}


