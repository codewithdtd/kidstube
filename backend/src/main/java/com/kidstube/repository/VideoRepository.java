package com.kidstube.repository;

import com.kidstube.domain.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    List<Video> findByCategoryIdAndIsActiveTrueOrderByCreatedAtDesc(Long categoryId);

    List<Video> findByIsActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.category LEFT JOIN FETCH v.channel WHERE v.isActive = true ORDER BY v.createdAt DESC")
    List<Video> findActiveVideosWithDetails();

    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.category LEFT JOIN FETCH v.channel WHERE v.category.id = :categoryId AND v.isActive = true ORDER BY v.createdAt DESC")
    List<Video> findActiveVideosByCategoryIdWithDetails(@Param("categoryId") Long categoryId);
    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.category LEFT JOIN FETCH v.channel WHERE v.isShort = true AND v.isActive = true ORDER BY v.createdAt DESC")
    List<Video> findActiveShortsWithDetails();


    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.category LEFT JOIN FETCH v.channel ORDER BY v.createdAt DESC")
    List<Video> findAllVideosWithDetails();

    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.category LEFT JOIN FETCH v.channel WHERE v.category.id = :categoryId ORDER BY v.createdAt DESC")
    List<Video> findAllVideosByCategoryIdWithDetails(@Param("categoryId") Long categoryId);

    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.category LEFT JOIN FETCH v.channel WHERE v.id = :id")
    Optional<Video> findByIdWithDetails(@Param("id") Long id);

    Optional<Video> findByYoutubeVideoId(String youtubeVideoId);

    boolean existsByYoutubeVideoId(String youtubeVideoId);

    long countByCategoryId(Long categoryId);
}

