package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository;

import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGameStats;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FindNumberGameStatsRepository extends JpaRepository<FindNumberGameStats, UUID> {
    Optional<FindNumberGameStats> findByPlayer(MyUserDetail user);
    Optional<FindNumberGameStats> findByPlayerUsername(String username);
}
