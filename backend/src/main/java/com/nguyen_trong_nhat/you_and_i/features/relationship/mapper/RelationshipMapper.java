package com.nguyen_trong_nhat.you_and_i.features.relationship.mapper;

import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipDTO;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.Relationship;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.RelationshipMember;
import org.mapstruct.Mapper;

import java.util.UUID;

@Mapper(componentModel = "spring")
public abstract class RelationshipMapper {
	public abstract RelationshipDTO toRelationshipDTO(Relationship relationship);

	protected UUID map(RelationshipMember relationshipMember) {
		if (relationshipMember == null) {
			return null;
		}

		if (relationshipMember.getUser() == null) {
			return null;
		}

		return relationshipMember.getUser().getId();
	}
}
