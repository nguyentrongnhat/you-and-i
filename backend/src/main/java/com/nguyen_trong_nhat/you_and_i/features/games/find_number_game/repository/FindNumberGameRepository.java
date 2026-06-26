package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository;

import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface FindNumberGameRepository extends JpaRepository<FindNumberGame, UUID> {
    List<FindNumberGame> findByPlayerUsernameAndEndTimeIsNotNull(String playerUsername);

    List<FindNumberGame> findByPlayerUsernameAndEndTimeIsNull(String playerUsername);

    @Query(value = """
        SELECT g.*
        FROM (
            SELECT f.*,
                   ROW_NUMBER() OVER (
                       PARTITION BY f.user_id
                       ORDER BY f.completion_time ASC, f.id ASC
                   ) rn
            FROM find_number_games f
        ) g
        WHERE g.rn = 1
        """, nativeQuery = true)
    List<FindNumberGame> findBestGamesForRanking();


    @Query("""
        select g
        from FindNumberGame g
        where g.player.username = :username
          and g.endTime is not null
        order by g.endTime desc
        """)
    List<FindNumberGame> findRecentGame(
            @Param("username") String username,
            Pageable pageable
    );


    @Modifying
    @Query("""
        delete from FindNumberGame g
        where g.player.username = :username
          and g.id not in :ids
        """)
    int deleteAllByPlayerIdAndIdNotIn(
            @Param("username") String username,
            @Param("ids") Collection<UUID> ids
    );
}
