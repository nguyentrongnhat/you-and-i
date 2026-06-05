package com.nguyen_trong_nhat.you_and_i.features.user.mapper;

import com.nguyen_trong_nhat.you_and_i.features.user.dto.UserDetailDTO;
import com.nguyen_trong_nhat.you_and_i.features.user.dto.UserProfileDTO;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.Role;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserProfile;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.RoleRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
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
                myUserDetail.getRoles().stream()
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


    public MyUserDetail updateEntityFromDTO(UserDetailDTO userDetailDTO, MyUserDetail myUserDetail) {
        if (userDetailDTO == null || myUserDetail == null) {
            return myUserDetail;
        }

        myUserDetail.setUsername(userDetailDTO.getUsername());

        if(!myUserDetail.isEnabled() && userDetailDTO.isEnabled()) {
            myUserDetail.setEnableAt(LocalDateTime.now());
        }

        myUserDetail.setEnabled(userDetailDTO.isEnabled());
        myUserDetail.setEmailVerified(userDetailDTO.isEmailVerified());

        UserProfile profile = myUserDetail.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(myUserDetail);
            myUserDetail.setProfile(profile);
        }
        updateUserProfileFromDTO(userDetailDTO.getProfile(), profile);

        myUserDetail.setRoles(convertStringSetToRoleSet(userDetailDTO.getRoles()));

        return myUserDetail;
    }


    public void updateUserProfileFromDTO(UserProfileDTO userProfileDTO, UserProfile userProfile) {
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

        return roleRepository.findByNameIn(roleNames);
    }
}
