import axios, { type AxiosResponse } from 'axios';
import type { 
  ApiResponse, 
  LoginRequest, 
  RegisterRequest, 
  ResetPasswordRequest,
  LoginResponse,
  Board,
  BoardRequest
} from '../types';

// API 기본 URL 설정
const API_BASE_URL = 'https://localhost:7276/api'; // 백엔드 URL에 맞게 수정

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT 토큰을 헤더에 추가하는 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 (토큰 만료 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃 처리
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  // 로그인
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post('/auth/login', data);
    return response.data;
  },

  // 회원가입
  register: async (data: RegisterRequest): Promise<ApiResponse<string>> => {
    const response: AxiosResponse<ApiResponse<string>> = await api.post('/auth/register', data);
    return response.data;
  },

  // 비밀번호 재설정
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<string>> => {
    const response: AxiosResponse<ApiResponse<string>> = await api.post('/auth/reset-password', data);
    return response.data;
  },
};

// 게시판 관련 API
export const boardAPI = {
  // 게시글 목록 조회
  getBoards: async (): Promise<ApiResponse<Board[]>> => {
    const response: AxiosResponse<ApiResponse<Board[]>> = await api.get('/board');
    return response.data;
  },

  // 게시글 상세 조회
  getBoard: async (id: number): Promise<ApiResponse<Board>> => {
    const response: AxiosResponse<ApiResponse<Board>> = await api.get(`/board/${id}`);
    return response.data;
  },

  // 게시글 작성
  createBoard: async (data: BoardRequest): Promise<ApiResponse<Board>> => {
    const response: AxiosResponse<ApiResponse<Board>> = await api.post('/board', data);
    return response.data;
  },

  // 게시글 수정
  updateBoard: async (id: number, data: BoardRequest): Promise<ApiResponse<Board>> => {
    const response: AxiosResponse<ApiResponse<Board>> = await api.put(`/board/${id}`, data);
    return response.data;
  },

  // 게시글 삭제
  deleteBoard: async (id: number): Promise<ApiResponse<string>> => {
    const response: AxiosResponse<ApiResponse<string>> = await api.delete(`/board/${id}`);
    return response.data;
  },
};

export default api;