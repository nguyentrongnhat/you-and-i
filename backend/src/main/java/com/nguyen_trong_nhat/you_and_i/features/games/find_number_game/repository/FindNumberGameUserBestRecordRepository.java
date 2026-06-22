package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository;

import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGameUserBestRecord;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FindNumberGameUserBestRecordRepository extends JpaRepository<FindNumberGameUserBestRecord, UUID> {
    Optional<FindNumberGameUserBestRecord> findByPlayer(MyUserDetail user);
    Optional<FindNumberGameUserBestRecord> findByPlayerUsername(String username);
}
