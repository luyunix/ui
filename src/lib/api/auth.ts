import { get, post } from "./fetch";
import type {
  AuthResponse,
  LoginParams,
  RegisterParams,
  UpdateProfileParams,
  UserInfo,
} from "./types";

export const authApi = {
  register: (params: RegisterParams): Promise<AuthResponse> => {
    return post<AuthResponse>("/auth/register", params);
  },

  login: (params: LoginParams): Promise<AuthResponse> => {
    return post<AuthResponse>("/auth/login", params);
  },

  me: (): Promise<UserInfo> => {
    return get<UserInfo>("/auth/me");
  },

  updateMe: (params: UpdateProfileParams): Promise<UserInfo> => {
    return post<UserInfo>("/auth/me", params);
  },
};
