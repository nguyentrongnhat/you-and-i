package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity;

import com.nguyen_trong_nhat.you_and_i.common.entity.BaseEntity;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "find_number_game_user_best_record")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FindNumberGameUserBestRecord extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private MyUserDetail player;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "best_game_id", nullable = false)
    private FindNumberGame bestGame;

    @Column(nullable = false)
    private Integer bestCompletionTime;
}
