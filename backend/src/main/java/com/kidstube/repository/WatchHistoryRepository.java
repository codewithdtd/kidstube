package com.kidstube.repository;

import com.kidstube.domain.entity.WatchHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface WatchHistoryRepository extends JpaRepository<WatchHistory, Long> {

    List<WatchHistory> findAllByOrderByWatchedAtDesc();

    @Query("SELECT COALESCE(SUM(w.watchedSeconds), 0) FROM WatchHistory w WHERE w.watchedAt >= :since")
    Integer findTotalWatchedSecondsSince(@Param("since") OffsetDateTime since);

    @Query("SELECT w FROM WatchHistory w LEFT JOIN FETCH w.video v ORDER BY w.watchedAt DESC")
    List<WatchHistory> findRecentWithVideo(Pageable pageable);
}

