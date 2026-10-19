package com.nguyen_trong_nhat.you_and_i.features.relationship.mapper;

import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipDTO;
import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipMemberDTO;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.Relationship;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.RelationshipMember;
import com.nguyen_trong_nhat.you_and_i.features.user.mapper.UserDataMapper;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = UserDataMapper.class)
public interface RelationshipMapper {
    @Mapping(target = "members", source = "members")
    RelationshipDTO toRelationshipDTO(Relationship relationship);

    @Mapping(target = "user", source = "user")
    RelationshipMemberDTO toRelationshipMemberDTO(RelationshipMember relationshipMember);

    /**
     * Updates an existing entity from the given DTO.
     * - Null properties in the DTO are ignored (partial update)
     * - id and members are not mapped (members are handled in the service because users must be loaded from the DB)
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    void updateRelationshipFromDTO(RelationshipDTO relationshipDTO, @MappingTarget Relationship relationship);

    /**
     * Creates a new entity from the given DTO (members excluded).
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    Relationship toRelationship(RelationshipDTO relationshipDTO);
}
