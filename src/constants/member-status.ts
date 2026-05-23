
export const WORKSPACE_ROLE = {
  ADMIN: "admin",
  MEMBER: "member",
  OWNER: "owner",
  OBSERVER: "observer",
} as const;

export const MEMBER_STATUS = {
  ACTIVE: "active",
  INVITED: "invited",
  REMOVED: "removed",
  CANCELLED: "cancelled",
} as const;