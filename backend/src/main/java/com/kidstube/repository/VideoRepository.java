package com.kidstube.repository;

import com.kidstube.domain.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    List<Video> findByCategoryIdAndIsActiveTrueOrderByCreatedAtDesc(Long categoryId);

    List<Video> findByIsActiveTrueOrderByCreatedAtDesc();

    Optional<Video> findByYoutubeVideoId(String youtubeVideoId);

    boolean existsByYoutubeVideoId(String youtubeVideoId);
}
