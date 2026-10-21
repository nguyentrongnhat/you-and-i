import { UserDetails } from "./user.dtos";

export interface Relationship {
  id: string | null;
  active: boolean;
  type: RelationshipType;
  name: string;
  status: RelationshipStatus;
  startAt: string;
  members: RelationshipMember[];
}

export interface RelationshipMember {
  id: string | null;
  active: boolean;
  user: UserDetails;
}

export enum RelationshipType {
  FRIENDSHIP = 'FRIENDSHIP',
  ROMANTIC  = 'ROMANTIC',
  FAMILY = 'FAMILY',
  GROUP = 'GROUP'
}

export enum RelationshipStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}