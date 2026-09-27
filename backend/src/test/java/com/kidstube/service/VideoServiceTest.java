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
import com.kidstube.service.youtube.YouTubeMetadataFetcher;
import com.kidstube.service.youtube.YouTubeParsedUrl;
import com.kidstube.service.youtube.YouTubeUrlParser;
import com.kidstube.service.youtube.YouTubeVideoMetadata;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VideoServiceTest {

    @Mock
    private VideoRepository videoRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ChannelRepository channelRepository;

    @Mock
    private YouTubeUrlParser urlParser;

    @Mock
    private YouTubeMetadataFetcher metadataFetcher;

    @InjectMocks
    private VideoService videoService;

    private Category sampleCategory;
    private Channel sampleChannel;

    @BeforeEach
    void setUp() {
        sampleCategory = Category.builder()
                .id(1L)
                .name("Hoạt hình")
                .iconUrl("https://example.com/icon.png")
                .displayOrder(1)
                .build();

        sampleChannel = Channel.builder()
                .id(10L)
                .youtubeChannelId("creator_vid123")
                .title("Kid Creator")
                .customUrl("https://youtube.com/@kidcreator")
                .thumbnailUrl("https://example.com/channel.jpg")
                .build();
    }

    @Test
    @DisplayName("Nên nạp thành công Single Video khi chưa có trong DB")
    void shouldImportNewSingleVideoSuccessfully() {
        ImportVideoRequest request = new ImportVideoRequest("https://youtu.be/vid12345678", 1L);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        when(urlParser.parse(request.url())).thenReturn(
                new YouTubeParsedUrl(YouTubeParsedUrl.ParsedType.SINGLE_VIDEO, "vid12345678")
        );
        when(videoRepository.findByYoutubeVideoId("vid12345678")).thenReturn(Optional.empty());
        when(metadataFetcher.fetchVideoMetadata("vid12345678")).thenReturn(
                new YouTubeVideoMetadata("vid12345678", "Vui cùng bé", "Kid Creator", "", "https://example.com/thumb.jpg", 120)
        );
        when(channelRepository.findByYoutubeChannelId(any())).thenReturn(Optional.of(sampleChannel));

        Video savedVideo = Video.builder()
                .id(100L)
                .youtubeVideoId("vid12345678")
                .title("Vui cùng bé")
                .thumbnailUrl("https://example.com/thumb.jpg")
                .durationSeconds(120)
                .category(sampleCategory)
                .channel(sampleChannel)
                .isActive(true)
                .build();
        when(videoRepository.save(any(Video.class))).thenReturn(savedVideo);

        ImportResultResponse response = videoService.importFromUrl(request);

        assertThat(response.importType()).isEqualTo("SINGLE_VIDEO");
        assertThat(response.importedCount()).isEqualTo(1);
        assertThat(response.videos()).hasSize(1);
        assertThat(response.videos().get(0).youtubeVideoId()).isEqualTo("vid12345678");

        verify(videoRepository).save(any(Video.class));
    }

    @Test
    @DisplayName("Nên cập nhật êm dịu khi nạp video đã tồn tại trong DB (Idempotent)")
    void shouldUpdateCategoryWhenVideoAlreadyExists() {
        ImportVideoRequest request = new ImportVideoRequest("https://youtu.be/vid12345678", 1L);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        when(urlParser.parse(request.url())).thenReturn(
                new YouTubeParsedUrl(YouTubeParsedUrl.ParsedType.SINGLE_VIDEO, "vid12345678")
        );

        Video existingVideo = Video.builder()
                .id(100L)
                .youtubeVideoId("vid12345678")
                .title("Vui cùng bé")
                .thumbnailUrl("https://example.com/thumb.jpg")
                .category(null)
                .channel(sampleChannel)
                .isActive(false)
                .build();
        when(videoRepository.findByYoutubeVideoId("vid12345678")).thenReturn(Optional.of(existingVideo));
        when(videoRepository.save(existingVideo)).thenReturn(existingVideo);

        ImportResultResponse response = videoService.importFromUrl(request);

        assertThat(response.importedCount()).isEqualTo(1);
        assertThat(existingVideo.getCategory()).isEqualTo(sampleCategory);
        assertThat(existingVideo.getIsActive()).isTrue();
        verify(metadataFetcher, never()).fetchVideoMetadata(any());
    }

    @Test
    @DisplayName("Nên ném ngoại lệ ResourceNotFoundException khi categoryId không tồn tại")
    void shouldThrowExceptionWhenCategoryNotFound() {
        ImportVideoRequest request = new ImportVideoRequest("https://youtu.be/vid12345678", 999L);
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> videoService.importFromUrl(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("Nên lấy danh sách video an toàn cho bé")
    void shouldGetVideosForKid() {
        Video video = Video.builder()
                .id(1L)
                .youtubeVideoId("abc12345678")
                .title("Hoạt hình cho bé")
                .category(sampleCategory)
                .channel(sampleChannel)
                .isActive(true)
                .build();

        when(videoRepository.findActiveVideosWithDetails()).thenReturn(List.of(video));

        List<VideoResponse> responses = videoService.getVideosForKid(null);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).title()).isEqualTo("Hoạt hình cho bé");
        assertThat(responses.get(0).categoryName()).isEqualTo("Hoạt hình");
    }

    @Test
    @DisplayName("Nên cập nhật trạng thái hiển thị của video")
    void shouldUpdateVideoStatus() {
        Video video = Video.builder()
                .id(1L)
                .youtubeVideoId("abc12345678")
                .title("Hoạt hình cho bé")
                .category(sampleCategory)
                .channel(sampleChannel)
                .isActive(true)
                .build();

        when(videoRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(video));
        when(videoRepository.save(video)).thenReturn(video);

        UpdateVideoRequest request = new UpdateVideoRequest(false, null);
        VideoResponse updated = videoService.updateVideo(1L, request);

        assertThat(updated.isActive()).isFalse();
        verify(videoRepository).save(video);
    }

    @Test
    @DisplayName("Nên xóa video thành công khi video tồn tại")
    void shouldDeleteVideoSuccessfully() {
        when(videoRepository.existsById(1L)).thenReturn(true);

        videoService.deleteVideo(1L);

        verify(videoRepository).deleteById(1L);
    }

}
