package com.kidstube.repository;

import com.kidstube.domain.entity.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, Long> {

    Optional<Channel> findByYoutubeChannelId(String youtubeChannelId);

    boolean existsByYoutubeChannelId(String youtubeChannelId);
}
