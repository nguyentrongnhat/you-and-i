package com.nguyen_trong_nhat.you_and_i.features.user.mapper;

import com.nguyen_trong_nhat.you_and_i.features.role.repository.RoleRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.dto.UpdateUserRequest;
import com.nguyen_trong_nhat.you_and_i.features.user.dto.UserDetailDTO;
import com.nguyen_trong_nhat.you_and_i.features.user.dto.UserProfileDTO;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.role.entity.Role;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserProfile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserDataMapper {
    private final RoleRepository roleRepository;

    public UserDataMapper(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }


    public UserDetailDTO toUserDetailDTO(MyUserDetail myUserDetail) {
        if (myUserDetail == null) {
            return null;
        }

        UserDetailDTO userDetailDTO = new UserDetailDTO();
        userDetailDTO.setId(myUserDetail.getId());
        userDetailDTO.setUsername(myUserDetail.getUsername());
        userDetailDTO.setEnabled(myUserDetail.isEnabled());
        userDetailDTO.setEmailVerified(myUserDetail.isEmailVerified());
        userDetailDTO.setProfile(toUserProfileDTO(myUserDetail.getProfile()));
        userDetailDTO.setRoles(
                myUserDetail.getRoles() == null ? Set.of() : myUserDetail.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet())
        );

        return userDetailDTO;
    }


    public UserProfileDTO toUserProfileDTO(UserProfile userProfile) {
        if (userProfile == null) {
            return null;
        }

        UserProfileDTO userProfileDTO = new UserProfileDTO();
        userProfileDTO.setFullName(userProfile.getFullName());
        userProfileDTO.setDisplayName(userProfile.getDisplayName());
        userProfileDTO.setAvatarUrl(userProfile.getAvatarUrl());
        userProfileDTO.setPhone(userProfile.getPhone());
        userProfileDTO.setDateOfBirth(userProfile.getDateOfBirth());
        userProfileDTO.setGender(userProfile.getGender());
        userProfileDTO.setBio(userProfile.getBio());
        userProfileDTO.setAddress(userProfile.getAddress());

        return userProfileDTO;
    }


    public UserProfile toUserProfile(UserProfileDTO userProfileDTO) {
        if (userProfileDTO == null) {
            return null;
        }

        UserProfile userProfile = new UserProfile();
        userProfile.setFullName(userProfileDTO.getFullName());
        userProfile.setDisplayName(userProfileDTO.getDisplayName());
        userProfile.setAvatarUrl(userProfileDTO.getAvatarUrl());
        userProfile.setPhone(userProfileDTO.getPhone());
        userProfile.setDateOfBirth(userProfileDTO.getDateOfBirth());
        userProfile.setGender(userProfileDTO.getGender());
        userProfile.setBio(userProfileDTO.getBio());
        userProfile.setAddress(userProfileDTO.getAddress());

        return userProfile;
    }


    public MyUserDetail toMyUserDetail(UserDetailDTO userDetailDTO) {
        if (userDetailDTO == null) {
            return null;
        }

        MyUserDetail myUserDetail = new MyUserDetail();
        myUserDetail.setUsername(userDetailDTO.getUsername());
        myUserDetail.setEnabled(userDetailDTO.isEnabled());
        myUserDetail.setEmailVerified(userDetailDTO.isEmailVerified());
        myUserDetail.setProfile(toUserProfile(userDetailDTO.getProfile()));
        myUserDetail.setRoles(convertStringSetToRoleSet(userDetailDTO.getRoles()));

        return myUserDetail;
    }


    public MyUserDetail updateUserProfileFromRequest(UpdateUserRequest updateUserRequest, MyUserDetail myUserDetail) {
        if (updateUserRequest == null || myUserDetail == null) {
            return myUserDetail;
        }

        UserProfile profile = myUserDetail.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(myUserDetail);
            myUserDetail.setProfile(profile);
        }
        updateUserProfileFromDTO(updateUserRequest.getProfile(), profile);

        return myUserDetail;
    }


    public MyUserDetail applyAdminFields(UpdateUserRequest updateUserRequest, MyUserDetail myUserDetail) {
        if (updateUserRequest == null || myUserDetail == null) {
            return myUserDetail;
        }

        if (updateUserRequest.getEnabled() != null) {
            if (!myUserDetail.isEnabled() && updateUserRequest.getEnabled()) {
                myUserDetail.setEnableAt(LocalDateTime.now());
            }
            myUserDetail.setEnabled(updateUserRequest.getEnabled());
        }

        if (updateUserRequest.getEmailVerified() != null) {
            myUserDetail.setEmailVerified(updateUserRequest.getEmailVerified());
        }

        if (updateUserRequest.getRoles() != null) {
            myUserDetail.setRoles(convertStringSetToRoleSet(updateUserRequest.getRoles()));
        }

        return myUserDetail;
    }


    public void updateUserProfileFromDTO(UserProfileDTO userProfileDTO, UserProfile userProfile) {
        if (userProfileDTO == null || userProfile == null) {
            return;
        }

        userProfile.setFullName(userProfileDTO.getFullName());
        userProfile.setDisplayName(userProfileDTO.getDisplayName());
        userProfile.setAvatarUrl(userProfileDTO.getAvatarUrl());
        userProfile.setPhone(userProfileDTO.getPhone());
        userProfile.setDateOfBirth(userProfileDTO.getDateOfBirth());
        userProfile.setGender(userProfileDTO.getGender());
        userProfile.setBio(userProfileDTO.getBio());
        userProfile.setAddress(userProfileDTO.getAddress());
    }


    private Set<Role> convertStringSetToRoleSet(Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return new HashSet<>();
        }

        Set<String> normalizedRoleNames = roleNames.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isBlank())
                .collect(Collectors.toSet());

        if (normalizedRoleNames.isEmpty()) {
            return new HashSet<>();
        }

        return roleRepository.findByNameIn(normalizedRoleNames);
    }
}
