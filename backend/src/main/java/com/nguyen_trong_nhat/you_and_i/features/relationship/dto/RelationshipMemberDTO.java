package com.nguyen_trong_nhat.you_and_i.features.relationship.dto;

import com.nguyen_trong_nhat.you_and_i.features.user.dto.UserDetailDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RelationshipMemberDTO {
    private UUID id;
    private boolean active;
    private UserDetailDTO user;
}
