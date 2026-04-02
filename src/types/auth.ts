import { Role, UserStatus } from "../constants/enums";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
};

export type JwtPayload = AuthUser;
