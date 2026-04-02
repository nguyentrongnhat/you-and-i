package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository;

import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FindNumberGameRepository extends JpaRepository<FindNumberGame, UUID> {
    List<FindNumberGame> findByEndTimeIsNull();
    List<FindNumberGame> findByPlayerAndEndTimeIsNotNull(MyUserDetail player);
}
