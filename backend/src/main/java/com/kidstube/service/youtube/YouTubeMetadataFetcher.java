package com.kidstube.service.youtube;

import com.kidstube.exception.YoutubeFetchException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class YouTubeMetadataFetcher {

    private static final Logger log = LoggerFactory.getLogger(YouTubeMetadataFetcher.class);

    private static final Pattern CHANNEL_ID_HTML_PATTERN = Pattern.compile(
            "(?:itemprop=[\"'](?:channelId|identifier)[\"'] content=[\"']|\"channelId\":[\"']|channel/)(UC[a-zA-Z0-9_-]{22})[\"']?"
    );

    private final RestClient restClient;

    public YouTubeMetadataFetcher(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) KidsTube/1.0")
                .build();
    }
    private final java.net.http.HttpClient shortCheckClient = java.net.http.HttpClient.newBuilder()
            .followRedirects(java.net.http.HttpClient.Redirect.NEVER)
            .connectTimeout(java.time.Duration.ofMillis(2500))
            .build();


    public record OEmbedData(
            String title,
            String author_name,
            String author_url,
            String thumbnail_url
    ) {}

    /**
     * Fetch metadata for a single video using public YouTube oEmbed API (Zero-Quota).
     */
    public YouTubeVideoMetadata fetchVideoMetadata(String videoId) {
        String oembedUrl = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" + videoId + "&format=json";
        try {
            log.info("Fetching YouTube oEmbed metadata for videoId: {}", videoId);
            OEmbedData data = restClient.get()
                    .uri(oembedUrl)
                    .retrieve()
                    .body(OEmbedData.class);

            if (data == null) {
                throw new YoutubeFetchException("Không nhận được dữ liệu oEmbed từ YouTube cho video: " + videoId);
            }

            String thumbnail = (data.thumbnail_url() != null && !data.thumbnail_url().isBlank())
                    ? data.thumbnail_url()
                    : "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";

            String authorName = (data.author_name() != null && !data.author_name().isBlank())
                    ? data.author_name()
                    : "YouTube Creator";

            String authorUrl = data.author_url() != null ? data.author_url() : "";

            return new YouTubeVideoMetadata(
                    videoId,
                    data.title() != null ? data.title() : "Video " + videoId,
                    authorName,
                    authorUrl,
                    thumbnail,
                    0
            );
        } catch (Exception ex) {
            log.error("Failed to fetch oEmbed metadata for video {}: {}", videoId, ex.getMessage());
            return new YouTubeVideoMetadata(
                    videoId,
                    "YouTube Video " + videoId,
                    "YouTube Creator",
                    "",
                    "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg",
                    0
            );
        }
    }


    /**
     * Check if a video is a YouTube Short.
     * YouTube redirects regular long videos from /shorts/{id} to /watch?v={id} (HTTP 303/302).
     * Only true YouTube Shorts return HTTP 200 OK.
     */
    public boolean checkIfShort(String videoId) {
        if (videoId == null || videoId.isBlank()) {
            return false;
        }
        try {
            java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://www.youtube.com/shorts/" + videoId))
                    .method("HEAD", java.net.http.HttpRequest.BodyPublishers.noBody())
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(java.time.Duration.ofMillis(2500))
                    .build();

            java.net.http.HttpResponse<Void> resp = shortCheckClient.send(req, java.net.http.HttpResponse.BodyHandlers.discarding());
            boolean isShort = resp.statusCode() == 200;
            log.info("Video {} short check returned HTTP {}: isShort={}", videoId, resp.statusCode(), isShort);
            return isShort;
        } catch (Exception ex) {
            log.warn("Could not determine if video {} is a short via HEAD request: {}", videoId, ex.getMessage());
            return false;
        }
    }

    /**
     * Fetch channel details and recent videos via YouTube RSS Feed.
     */
    public YouTubeChannelFeed fetchChannelFeed(YouTubeParsedUrl parsedUrl) {
        String channelId = resolveChannelId(parsedUrl);
        String rssUrl = "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelId;

        try {
            log.info("Fetching YouTube channel RSS feed from: {}", rssUrl);
            byte[] responseBytes = restClient.get()
                    .uri(rssUrl)
                    .retrieve()
                    .body(byte[].class);

            if (responseBytes == null || responseBytes.length == 0) {
                throw new YoutubeFetchException("Không thể tải RSS feed cho kênh: " + channelId);
            }

            return parseRssFeed(channelId, responseBytes);
        } catch (Exception ex) {
            log.error("Failed to fetch channel feed for {}: {}", channelId, ex.getMessage());
            throw new YoutubeFetchException("Lỗi khi tải dữ liệu kênh YouTube: " + ex.getMessage(), ex);
        }
    }

    /**
     * Resolve YouTube Channel ID (UC...) from handle or custom URL if needed.
     */
    public String resolveChannelId(YouTubeParsedUrl parsedUrl) {
        if (parsedUrl.type() == YouTubeParsedUrl.ParsedType.CHANNEL_ID) {
            return parsedUrl.identifier();
        }

        String targetUrl = switch (parsedUrl.type()) {
            case CHANNEL_HANDLE -> "https://www.youtube.com/" + parsedUrl.identifier();
            case CHANNEL_CUSTOM -> "https://www.youtube.com/c/" + parsedUrl.identifier();
            default -> "https://www.youtube.com/" + parsedUrl.identifier();
        };

        try {
            log.info("Resolving channel ID from page: {}", targetUrl);
            String html = restClient.get()
                    .uri(targetUrl)
                    .retrieve()
                    .body(String.class);

            if (html != null) {
                Matcher matcher = CHANNEL_ID_HTML_PATTERN.matcher(html);
                if (matcher.find()) {
                    String resolvedId = matcher.group(1);
                    log.info("Successfully resolved channel ID: {}", resolvedId);
                    return resolvedId;
                }
            }
        } catch (Exception ex) {
            log.warn("Could not fetch page to resolve channel ID for {}: {}", targetUrl, ex.getMessage());
        }

        throw new YoutubeFetchException("Không thể tìm thấy Channel ID cho đường dẫn: " + parsedUrl.identifier());
    }


    private YouTubeChannelFeed parseRssFeed(String channelId, byte[] xmlBytes) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            // DevSecOps: Protect against XXE (XML External Entity Injection)
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setNamespaceAware(true);

            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xmlBytes));

            // Extract Channel Title
            String channelTitle = "YouTube Channel";
            NodeList titleNodes = doc.getElementsByTagName("title");
            if (titleNodes.getLength() > 0) {
                channelTitle = titleNodes.item(0).getTextContent().trim();
            }

            // Extract Author URI
            String channelUrl = "https://www.youtube.com/channel/" + channelId;
            NodeList uriNodes = doc.getElementsByTagName("uri");
            if (uriNodes.getLength() > 0) {
                channelUrl = uriNodes.item(0).getTextContent().trim();
            }

            // Extract entries (videos)
            List<YouTubeVideoMetadata> videos = new ArrayList<>();
            NodeList entryNodes = doc.getElementsByTagName("entry");

            for (int i = 0; i < entryNodes.getLength(); i++) {
                Element entry = (Element) entryNodes.item(i);

                String videoId = getElementTextByLocalName(entry, "videoId");
                String videoTitle = getElementTextByLocalName(entry, "title");
                String thumbnail = "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";

                NodeList mediaThumbnails = entry.getElementsByTagNameNS("*", "thumbnail");
                if (mediaThumbnails.getLength() > 0) {
                    Element thumbElem = (Element) mediaThumbnails.item(0);
                    if (thumbElem.hasAttribute("url")) {
                        thumbnail = thumbElem.getAttribute("url");
                    }
                }

                if (videoId != null && !videoId.isBlank()) {
                    videos.add(new YouTubeVideoMetadata(
                            videoId,
                            videoTitle != null ? videoTitle : "Video " + videoId,
                            channelTitle,
                            channelUrl,
                            thumbnail,
                            0
                    ));
                }
            }

            log.info("Parsed {} videos from channel '{}' ({})", videos.size(), channelTitle, channelId);
            return new YouTubeChannelFeed(channelId, channelTitle, channelUrl, videos);

        } catch (Exception ex) {
            throw new YoutubeFetchException("Lỗi khi xử lý cấu trúc XML từ YouTube RSS: " + ex.getMessage(), ex);
        }
    }

    private String getElementTextByLocalName(Element parent, String localName) {
        NodeList nodes = parent.getElementsByTagNameNS("*", localName);
        if (nodes.getLength() > 0) {
            return nodes.item(0).getTextContent().trim();
        }
        NodeList fallbackNodes = parent.getElementsByTagName(localName);
        if (fallbackNodes.getLength() > 0) {
            return fallbackNodes.item(0).getTextContent().trim();
        }
        return null;
    }

}
