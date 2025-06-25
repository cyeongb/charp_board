import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthContextType, LoginResponse } from '../types';
import { authAPI } from '../services/api';

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 인증 컨텍스트 프로바이더 Props
interface AuthProviderProps {
  children: ReactNode;
}

// 인증 컨텍스트 프로바이더 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData) as LoginResponse;
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('사용자 데이터 파싱 오류:', error);
        // 잘못된 데이터 제거
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // 로그인 함수
//   샘플 데이터
// pw : password123
// id: chulsoo@example.com
// younghee@example.com
// minsu@example.com
// sujin@example.com
// dayun@example.com
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password });
      
        console.log("res>>>>",response);

      if (response.success && response.data) {
        // 토큰과 사용자 정보를 로컬 스토리지에 저장
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // 상태 업데이트
        setUser(response.data);
        setIsAuthenticated(true);
        
        return true;
      } else {
        console.error('로그인 실패:', response.message);
        return false;
      }
    } catch (error) {
      console.error('로그인 요청 오류:', error);
      return false;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    // 로컬 스토리지에서 데이터 제거
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 상태 초기화
    setUser(null);
    setIsAuthenticated(false);
  };

  // 컨텍스트 값
  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 인증 컨텍스트 사용을 위한 커스텀 훅
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용되어야 합니다');
  }
  return context;
};