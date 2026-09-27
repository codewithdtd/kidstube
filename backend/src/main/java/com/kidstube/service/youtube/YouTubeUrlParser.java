package com.kidstube.service.youtube;

import com.kidstube.exception.InvalidYoutubeUrlException;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class YouTubeUrlParser {

    private static final Pattern WATCH_PATTERN = Pattern.compile(
            "(?:https?://)?(?:www\\.|m\\.)?youtube\\.com/watch\\?(?:[^&]*&)*v=([a-zA-Z0-9_-]{11})",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern SHORT_PATTERN = Pattern.compile(
            "(?:https?://)?youtu\\.be/([a-zA-Z0-9_-]{11})",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern SHORTS_OR_EMBED_PATTERN = Pattern.compile(
            "(?:https?://)?(?:www\\.|m\\.)?youtube\\.com/(?:shorts|embed)/([a-zA-Z0-9_-]{11})",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern RAW_ID_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9_-]{11}$"
    );

    private static final Pattern CHANNEL_ID_PATTERN = Pattern.compile(
            "(?:https?://)?(?:www\\.)?youtube\\.com/channel/(UC[a-zA-Z0-9_-]{22})",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern CHANNEL_HANDLE_PATTERN = Pattern.compile(
            "(?:https?://)?(?:www\\.)?youtube\\.com/(@[a-zA-Z0-9_.-]+)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern CHANNEL_CUSTOM_PATTERN = Pattern.compile(
            "(?:https?://)?(?:www\\.)?youtube\\.com/(?:c|user)/([a-zA-Z0-9_.-]+)",
            Pattern.CASE_INSENSITIVE
    );

    public YouTubeParsedUrl parse(String rawUrl) {
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            throw new InvalidYoutubeUrlException("Đường dẫn YouTube không được để trống.");
        }

        String url = rawUrl.trim();

        // 1. Raw 11-char ID
        Matcher rawMatcher = RAW_ID_PATTERN.matcher(url);
        if (rawMatcher.matches()) {
            return new YouTubeParsedUrl(YouTubeParsedUrl.ParsedType.SINGLE_VIDEO, url);
        }

        // 2. watch?v=
        Matcher watchMatcher = WATCH_PATTERN.matcher(url);
        if (watchMatcher.find()) {
            return new YouTubeParsedUrl(YouTubeParsedUrl.ParsedType.SINGLE_VIDEO, watchMatcher.group(1));
        }

        // 3. youtu.be
        Matcher shortMatcher = SHORT_PATTERN.matcher(url);
        if (shortMatcher.find()) {
            return new YouTubeParsedUrl(YouTubeParsedUrl.ParsedType.SINGLE_VIDEO, shortMatcher.group(1));
        }

        // 4. shorts or embed
        Matcher shortsMatcher = SHORTS_OR_EMBED_PATTERN.matcher(url);
        if (shortsMatcher.find()) {
            return new YouTubeParsedUrl(YouTubeParsedUrl.ParsedType.SINGLE_VIDEO, shortsMatcher.group(1));
        }

        // 5. channel/UC...
        Matcher channelIdMatcher = CHANNEL_ID_PATTERN.matcher(url);
        if (channelIdMatcher.find()) {
            return new YouTubeParsedUrl(YouTubeParsedUrl.ParsedType.CHANNEL_ID, channelIdMatcher.group(1));
        }

        // 6. @handle
        Matcher handleMatcher = CHANNEL_HANDLE_PATTERN.matcher(url);
        if (handleMatcher.find()) {
            return new YouTubeParsedUrl(YouTubeParsedUrl.ParsedType.CHANNEL_HANDLE, handleMatcher.group(1));
        }

        // 7. /c/ or /user/
        Matcher customMatcher = CHANNEL_CUSTOM_PATTERN.matcher(url);
        if (customMatcher.find()) {
            return new YouTubeParsedUrl(YouTubeParsedUrl.ParsedType.CHANNEL_CUSTOM, customMatcher.group(1));
        }

        throw new InvalidYoutubeUrlException("Đường dẫn không phải là URL hợp lệ của YouTube: " + rawUrl);
    }
}
