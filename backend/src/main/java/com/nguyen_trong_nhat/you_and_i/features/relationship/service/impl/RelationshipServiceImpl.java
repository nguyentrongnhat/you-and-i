package com.nguyen_trong_nhat.you_and_i.features.relationship.service.impl;

import com.nguyen_trong_nhat.you_and_i.common.exception.BadRequestException;
import com.nguyen_trong_nhat.you_and_i.common.exception.ForbidenException;
import com.nguyen_trong_nhat.you_and_i.common.exception.NotFoundException;
import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.security.util.SecurityUtils;
import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.*;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.Relationship;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.RelationshipMember;
import com.nguyen_trong_nhat.you_and_i.features.relationship.mapper.RelationshipMapper;
import com.nguyen_trong_nhat.you_and_i.features.relationship.repository.RelationshipMemberRepository;
import com.nguyen_trong_nhat.you_and_i.features.relationship.repository.RelationshipRepository;
import com.nguyen_trong_nhat.you_and_i.features.relationship.service.RelationshipService;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RelationshipServiceImpl implements RelationshipService {

    private final RelationshipRepository relationshipRepository;
    private final RelationshipMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final RelationshipMapper mapper;

    // ── helpers ────────────────────────────────────────────────────────────────

    /**
     * App-level administrators (ROLE_ADMIN / ROLE_SUPER_ADMIN) may manage the
     * relationships and members of any user, bypassing the per-relationship
     * membership permission checks.
     */
    private boolean isAppAdmin() {
        return SecurityUtils.hasAuthorities(Constants.ROLE_SUPER_ADMIN)
                || SecurityUtils.hasAuthorities(Constants.ROLE_ADMIN);
    }

    private MyUserDetail requireLoggedInUser() {
        String username = SecurityUtils.getLoggedInUsername();
        if (username == null) throw new ForbidenException("Not authenticated");
        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new NotFoundException("Authenticated user not found"));
    }

    private Relationship requireRelationship(UUID id) {
        return relationshipRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Relationship not found: " + id));
    }

    private Relationship requireDetailedRelationship(UUID id) {
        return relationshipRepository.findDetailedById(id)
                .orElseThrow(() -> new NotFoundException("Relationship not found: " + id));
    }

    private RelationshipMember requireMembership(UUID relationshipId, UUID userId) {
        return memberRepository.findByRelationshipIdAndUserId(relationshipId, userId)
                .orElseThrow(() -> new NotFoundException("Membership not found"));
    }

    private RelationshipMember requireDetailedMember(UUID memberId) {
        return memberRepository.findDetailedById(memberId)
                .orElseThrow(() -> new NotFoundException("Member not found: " + memberId));
    }

    private void requireActiveMember(UUID relationshipId, UUID userId) {
        if (isAppAdmin()) return;
        if (!memberRepository.existsByRelationshipIdAndUserIdAndActiveTrue(relationshipId, userId)) {
            throw new ForbidenException("You are not a member of this relationship");
        }
    }

    private void requireCanManage(UUID relationshipId, UUID userId) {
        if (isAppAdmin()) return;
        RelationshipRole role = memberRepository.findActiveRoleByRelationshipIdAndUserId(relationshipId, userId)
                .orElseThrow(() -> new NotFoundException("Membership not found"));

        if (!role.canManageRelationship()) {
            throw new ForbidenException("Only OWNER or ADMIN can perform this action");
        }
    }

    // ── Relationship CRUD ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public RelationshipDTO createRelationship(CreateRelationshipRequest request) {
        MyUserDetail creator = requireLoggedInUser();

        Relationship rel = new Relationship();
        rel.setType(request.getType());
        rel.setStatus(RelationshipStatus.ACTIVE);
        rel.setDescription(request.getDescription());
        rel.setStartAt(request.getStartAt() != null ? request.getStartAt() : Instant.now());
        rel = relationshipRepository.save(rel);

        RelationshipMember ownerMembership = new RelationshipMember();
        ownerMembership.setRelationship(rel);
        ownerMembership.setUser(creator);
        ownerMembership.setRole(RelationshipRole.OWNER);
        ownerMembership.setJoinedAt(Instant.now());
        ownerMembership.setActive(true);
        memberRepository.save(ownerMembership);

        rel.getMemberships().add(ownerMembership);

        return mapper.toDTO(rel);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RelationshipDTO> getMyRelationships() {
        MyUserDetail me = requireLoggedInUser();
        return relationshipRepository.findAllByUserId(me.getId())
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RelationshipDTO> getRelationshipsByUserId(UUID userId) {
        return relationshipRepository.findAllByUserId(userId)
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RelationshipDTO getRelationshipById(UUID relationshipId) {
        MyUserDetail me = requireLoggedInUser();
        requireActiveMember(relationshipId, me.getId());
        return mapper.toDTO(requireDetailedRelationship(relationshipId));
    }

    @Override
    @Transactional
    public RelationshipDTO updateRelationship(UUID relationshipId, UpdateRelationshipRequest request) {
        MyUserDetail me = requireLoggedInUser();
        requireCanManage(relationshipId, me.getId());

        Relationship rel = requireRelationship(relationshipId);
        if (request.getType() != null) rel.setType(request.getType());
        if (request.getStatus() != null) rel.setStatus(request.getStatus());
        if (request.getDescription() != null) rel.setDescription(request.getDescription());
        if (request.getStartAt() != null) rel.setStartAt(request.getStartAt());

        relationshipRepository.save(rel);
        return mapper.toDTO(requireDetailedRelationship(relationshipId));
    }

    @Override
    @Transactional
    public void deleteRelationship(UUID relationshipId) {
        MyUserDetail me = requireLoggedInUser();
        if (!isAppAdmin()) {
            RelationshipMember membership = requireMembership(relationshipId, me.getId());
            if (membership.getRole() != RelationshipRole.OWNER) {
                throw new ForbidenException("Only the OWNER can delete a relationship");
            }
        }
        relationshipRepository.deleteById(relationshipId);
    }

    // ── Member CRUD ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<RelationshipMemberDTO> getMembers(UUID relationshipId) {
        MyUserDetail me = requireLoggedInUser();
        requireActiveMember(relationshipId, me.getId());
        return memberRepository.findAllByRelationshipIdAndActiveTrue(relationshipId)
                .stream()
                .map(mapper::toMemberDTO)
                .toList();
    }

    @Override
    @Transactional
    public RelationshipMemberDTO addMember(UUID relationshipId, AddMemberRequest request) {
        MyUserDetail me = requireLoggedInUser();
        requireCanManage(relationshipId, me.getId());
        requireRelationship(relationshipId);

        if (request.getRole() == RelationshipRole.OWNER) {
            throw new BadRequestException("Cannot assign OWNER role when adding a member. Transfer ownership instead.");
        }

        MyUserDetail targetUser = userRepository.findDetailedById(request.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found: " + request.getUserId()));

        RelationshipMember savedMember = memberRepository.findByRelationshipIdAndUserId(relationshipId, targetUser.getId())
                .map(existing -> {
                    if (existing.isActive()) {
                        throw new BadRequestException("User is already an active member of this relationship");
                    }

                    existing.setActive(true);
                    existing.setRole(request.getRole());
                    existing.setJoinedAt(Instant.now());
                    return memberRepository.save(existing);
                })
                .orElseGet(() -> {
                    RelationshipMember newMember = new RelationshipMember();
                    newMember.setRelationship(relationshipRepository.getReferenceById(relationshipId));
                    newMember.setUser(targetUser);
                    newMember.setRole(request.getRole());
                    newMember.setJoinedAt(Instant.now());
                    newMember.setActive(true);
                    return memberRepository.save(newMember);
                });

        return mapper.toMemberDTO(savedMember);
    }

    @Override
    @Transactional
    public RelationshipMemberDTO updateMemberRole(UUID relationshipId, UUID memberId, UpdateMemberRoleRequest request) {
        MyUserDetail me = requireLoggedInUser();
        requireCanManage(relationshipId, me.getId());

        RelationshipMember target = requireDetailedMember(memberId);

        if (!relationshipId.equals(target.getRelationshipId())) {
            throw new BadRequestException("Member does not belong to this relationship");
        }
        if (request.getRole() == RelationshipRole.OWNER) {
            throw new BadRequestException("Cannot directly assign OWNER role. Transfer ownership instead.");
        }
        if (target.getRole() == RelationshipRole.OWNER) {
            throw new BadRequestException("Cannot change the OWNER's role directly. Transfer ownership instead.");
        }

        target.setRole(request.getRole());
        return mapper.toMemberDTO(memberRepository.save(target));
    }

    @Override
    @Transactional
    public void removeMember(UUID relationshipId, UUID memberId) {
        MyUserDetail me = requireLoggedInUser();

        RelationshipMember target = requireDetailedMember(memberId);

        if (!relationshipId.equals(target.getRelationshipId())) {
            throw new BadRequestException("Member does not belong to this relationship");
        }

        boolean isSelf = target.getUserId().equals(me.getId());
        boolean isManager = isAppAdmin() || memberRepository.findActiveRoleByRelationshipIdAndUserId(relationshipId, me.getId())
                .map(RelationshipRole::canManageMembers)
                .orElse(false);

        if (!isSelf && !isManager) {
            throw new ForbidenException("You do not have permission to remove this member");
        }
        if (target.getRole() == RelationshipRole.OWNER) {
            throw new BadRequestException("The OWNER cannot be removed. Transfer ownership first.");
        }

        target.setActive(false);
        memberRepository.save(target);
    }
}

