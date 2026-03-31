package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository;

import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FindNumberGameRepository extends JpaRepository<FindNumberGame, UUID> {
}
