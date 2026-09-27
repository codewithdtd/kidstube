package com.kidstube.service.youtube;

import com.kidstube.exception.InvalidYoutubeUrlException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class YouTubeUrlParserTest {

    private YouTubeUrlParser parser;

    @BeforeEach
    void setUp() {
        parser = new YouTubeUrlParser();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
            "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://youtu.be/dQw4w9WgXcQ",
            "https://youtu.be/dQw4w9WgXcQ?t=10",
            "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            "https://youtube.com/embed/dQw4w9WgXcQ",
            "dQw4w9WgXcQ"
    })
    @DisplayName("Nên nhận dạng đúng Single Video ID từ các định dạng URL khác nhau")
    void shouldParseSingleVideoUrls(String url) {
        YouTubeParsedUrl result = parser.parse(url);

        assertThat(result.type()).isEqualTo(YouTubeParsedUrl.ParsedType.SINGLE_VIDEO);
        assertThat(result.identifier()).isEqualTo("dQw4w9WgXcQ");
    }

    @Test
    @DisplayName("Nên nhận dạng đúng Channel ID (UC...)")
    void shouldParseChannelId() {
        String url = "https://www.youtube.com/channel/UCbCmjCuTUZos6Inko4u57UQ";
        YouTubeParsedUrl result = parser.parse(url);

        assertThat(result.type()).isEqualTo(YouTubeParsedUrl.ParsedType.CHANNEL_ID);
        assertThat(result.identifier()).isEqualTo("UCbCmjCuTUZos6Inko4u57UQ");
    }

    @Test
    @DisplayName("Nên nhận dạng đúng Channel Handle (@...)")
    void shouldParseChannelHandle() {
        String url = "https://www.youtube.com/@CoComelon";
        YouTubeParsedUrl result = parser.parse(url);

        assertThat(result.type()).isEqualTo(YouTubeParsedUrl.ParsedType.CHANNEL_HANDLE);
        assertThat(result.identifier()).isEqualTo("@CoComelon");
    }

    @Test
    @DisplayName("Nên nhận dạng đúng Custom Channel URL (/c/...)")
    void shouldParseCustomChannelUrl() {
        String url = "https://www.youtube.com/c/CoComelonSongs";
        YouTubeParsedUrl result = parser.parse(url);

        assertThat(result.type()).isEqualTo(YouTubeParsedUrl.ParsedType.CHANNEL_CUSTOM);
        assertThat(result.identifier()).isEqualTo("CoComelonSongs");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "",
            "   ",
            "https://facebook.com/watch?v=123",
            "https://tiktok.com/@user/video/123",
            "invalid_link_xyz"
    })
    @DisplayName("Nên ném ngoại lệ InvalidYoutubeUrlException khi gặp URL không hợp lệ")
    void shouldThrowExceptionForInvalidUrls(String invalidUrl) {
        assertThatThrownBy(() -> parser.parse(invalidUrl))
                .isInstanceOf(InvalidYoutubeUrlException.class);
    }
}
