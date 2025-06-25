// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// 사용자 관련 타입
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  name: string;
  email: string;
  newPassword: string;
}

export interface LoginResponse {
  token: string;
  name: string;
  email: string;
}

// 게시판 관련 타입
export interface Board {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  canEdit: boolean;
}

export interface BoardRequest {
  title: string;
  content: string;
}

// 인증 컨텍스트 타입
export interface AuthContextType {
  user: LoginResponse | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// DataGrid 컬럼 타입 (Material-UI용)
export interface BoardGridRow {
  id: number;
  title: string;
  authorName: string;
  createdAt: string;
  viewCount: number;
  canEdit: boolean;
}