export interface UsernamePasswordLoginResponse {
    accessToken: string,
    refreshToken: string,
    userInfo: UserDetails
}


export interface UserProfile {
    fullName: string;
    displayName: string;
    avatarUrl: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    bio: string;
    address: string;
}


export interface UserDetails {
    id: string;
    username: string;
    profile: UserProfile;
    roles: string[];
    enabled?: boolean;
    emailVerified?: boolean;
}