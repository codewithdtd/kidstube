package com.kidstube.service;

import com.kidstube.domain.dto.request.ImportVideoRequest;
import com.kidstube.domain.dto.request.UpdateVideoRequest;
import com.kidstube.domain.dto.response.ImportResultResponse;
import com.kidstube.domain.dto.response.VideoResponse;
import com.kidstube.domain.entity.Category;
import com.kidstube.domain.entity.Channel;
import com.kidstube.domain.entity.Video;
import com.kidstube.exception.ResourceNotFoundException;
import com.kidstube.repository.CategoryRepository;
import com.kidstube.repository.ChannelRepository;
import com.kidstube.repository.VideoRepository;
import com.kidstube.service.youtube.YouTubeChannelFeed;
import com.kidstube.service.youtube.YouTubeMetadataFetcher;
import com.kidstube.service.youtube.YouTubeParsedUrl;
import com.kidstube.service.youtube.YouTubeUrlParser;
import com.kidstube.service.youtube.YouTubeVideoMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional
public class VideoService {

    private static final Logger log = LoggerFactory.getLogger(VideoService.class);

    private final VideoRepository videoRepository;
    private final CategoryRepository categoryRepository;
    private final ChannelRepository channelRepository;
    private final YouTubeUrlParser urlParser;
    private final YouTubeMetadataFetcher metadataFetcher;

    public VideoService(
            VideoRepository videoRepository,
            CategoryRepository categoryRepository,
            ChannelRepository channelRepository,
            YouTubeUrlParser urlParser,
            YouTubeMetadataFetcher metadataFetcher
    ) {
        this.videoRepository = videoRepository;
        this.categoryRepository = categoryRepository;
        this.channelRepository = channelRepository;
        this.urlParser = urlParser;
        this.metadataFetcher = metadataFetcher;
    }

    @Transactional(readOnly = true)
    public List<VideoResponse> getVideosForKid(Long categoryId) {
        List<Video> videos = (categoryId != null)
                ? videoRepository.findActiveVideosByCategoryIdWithDetails(categoryId)
                : videoRepository.findActiveVideosWithDetails();

        return videos.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<VideoResponse> getAllVideosForParent(Long categoryId) {
        List<Video> videos = (categoryId != null)
                ? videoRepository.findAllVideosByCategoryIdWithDetails(categoryId)
                : videoRepository.findAllVideosWithDetails();

        return videos.stream().map(this::mapToResponse).toList();
    }

    public ImportResultResponse importFromUrl(ImportVideoRequest request) {
        Category category = resolveCategory(request.categoryId());

        YouTubeParsedUrl parsedUrl = urlParser.parse(request.url());

        if (parsedUrl.type() == YouTubeParsedUrl.ParsedType.SINGLE_VIDEO) {
            return importSingleVideo(parsedUrl.identifier(), category);
        } else {
            return importChannel(parsedUrl, category);
        }
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId != null) {
            return categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại với ID: " + categoryId));
        }
        return getRandomCategory();
    }

    private Category getRandomCategory() {
        List<Category> allCategories = categoryRepository.findAll();
        if (allCategories.isEmpty()) {
            throw new ResourceNotFoundException("Chưa có danh mục nào trong hệ thống");
        }
        int randomIndex = ThreadLocalRandom.current().nextInt(allCategories.size());
        Category chosen = allCategories.get(randomIndex);
        log.info("No category specified in import request, randomly assigned to category: {} (ID: {})",
                chosen.getName(), chosen.getId());
        return chosen;
    }

    private ImportResultResponse importSingleVideo(String videoId, Category category) {
        var existingOpt = videoRepository.findByYoutubeVideoId(videoId);
        if (existingOpt.isPresent()) {
            Video existing = existingOpt.get();
            existing.setCategory(category);
            existing.setIsActive(true);
            Video saved = videoRepository.save(existing);
            return new ImportResultResponse(
                    "SINGLE_VIDEO",
                    saved.getChannel() != null ? saved.getChannel().getTitle() : "YouTube",
                    1,
                    List.of(mapToResponse(saved)),
                    "Video đã tồn tại và được cập nhật danh mục thành công!"
            );
        }

        YouTubeVideoMetadata meta = metadataFetcher.fetchVideoMetadata(videoId);

        Channel channel = getOrCreateChannel(
                "creator_" + videoId,
                meta.authorName(),
                meta.authorUrl(),
                meta.thumbnailUrl()
        );

        Video video = Video.builder()
                .youtubeVideoId(videoId)
                .title(meta.title())
                .thumbnailUrl(meta.thumbnailUrl())
                .durationSeconds(meta.durationSeconds())
                .category(category)
                .channel(channel)
                .isActive(true)
                .build();

        Video saved = videoRepository.save(video);
        log.info("Successfully imported video {} ({})", saved.getYoutubeVideoId(), saved.getTitle());

        return new ImportResultResponse(
                "SINGLE_VIDEO",
                channel.getTitle(),
                1,
                List.of(mapToResponse(saved)),
                "Đã thêm 1 video thành công!"
        );
    }

    private ImportResultResponse importChannel(YouTubeParsedUrl parsedUrl, Category category) {
        YouTubeChannelFeed feed = metadataFetcher.fetchChannelFeed(parsedUrl);

        Channel channel = getOrCreateChannel(
                feed.channelId(),
                feed.channelTitle(),
                feed.channelUrl(),
                "https://img.icons8.com/color/96/youtube-play.png"
        );

        List<Video> savedVideos = new ArrayList<>();
        for (YouTubeVideoMetadata meta : feed.videos()) {
            var existingOpt = videoRepository.findByYoutubeVideoId(meta.videoId());
            if (existingOpt.isPresent()) {
                Video existing = existingOpt.get();
                existing.setCategory(category);
                existing.setIsActive(true);
                savedVideos.add(videoRepository.save(existing));
            } else {
                Video video = Video.builder()
                        .youtubeVideoId(meta.videoId())
                        .title(meta.title())
                        .thumbnailUrl(meta.thumbnailUrl())
                        .durationSeconds(meta.durationSeconds())
                        .category(category)
                        .channel(channel)
                        .isActive(true)
                        .build();
                savedVideos.add(videoRepository.save(video));
            }
        }

        log.info("Batch imported {} videos for channel '{}'", savedVideos.size(), feed.channelTitle());

        return new ImportResultResponse(
                "CHANNEL",
                feed.channelTitle(),
                savedVideos.size(),
                savedVideos.stream().map(this::mapToResponse).toList(),
                "Đã đồng bộ " + savedVideos.size() + " video từ kênh " + feed.channelTitle() + " thành công!"
        );
    }

    public VideoResponse updateVideo(Long id, UpdateVideoRequest request) {
        Video video = videoRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + id));

        if (request.isActive() != null) {
            video.setIsActive(request.isActive());
        }

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại với ID: " + request.categoryId()));
            video.setCategory(category);
        }

        Video updated = videoRepository.save(video);
        return mapToResponse(updated);
    }

    public void deleteVideo(Long id) {
        if (!videoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Video không tồn tại với ID: " + id);
        }
        videoRepository.deleteById(id);
        log.info("Deleted video ID: {}", id);
    }

    private Channel getOrCreateChannel(String channelId, String title, String customUrl, String thumbnailUrl) {
        return channelRepository.findByYoutubeChannelId(channelId)
                .orElseGet(() -> channelRepository.save(
                        Channel.builder()
                                .youtubeChannelId(channelId)
                                .title(title)
                                .customUrl(customUrl)
                                .thumbnailUrl(thumbnailUrl)
                                .build()
                ));
    }

    public VideoResponse mapToResponse(Video video) {
        return new VideoResponse(
                video.getId(),
                video.getYoutubeVideoId(),
                video.getTitle(),
                video.getThumbnailUrl(),
                video.getDurationSeconds(),
                video.getCategory() != null ? video.getCategory().getId() : null,
                video.getCategory() != null ? video.getCategory().getName() : null,
                video.getChannel() != null ? video.getChannel().getTitle() : null,
                video.getIsActive(),
                video.getCreatedAt()
        );
    }

}
