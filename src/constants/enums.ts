export const Roles = ["VIEWER", "ANALYST", "ADMIN"] as const;
export type Role = (typeof Roles)[number];

export const RecordTypes = ["INCOME", "EXPENSE"] as const;
export type RecordType = (typeof RecordTypes)[number];

export const UserStatuses = ["ACTIVE", "INACTIVE"] as const;
export type UserStatus = (typeof UserStatuses)[number];