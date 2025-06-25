import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// 보호된 라우트 컴포넌트 Props
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// 인증이 필요한 페이지를 보호하는 컴포넌트
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    // 로그인 후 원래 페이지로 돌아가기 위해 현재 위치 저장
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;