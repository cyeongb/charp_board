import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { koKR } from '@mui/material/locale';

// 컴포넌트 import
import { AuthProvider } from './components/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

// 페이지 import
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BoardListPage from './pages/BoardListPage';
import BoardDetailPage from './pages/BoardDetailPage';
import BoardFormPage from './pages/BoardFormPage';

// Material-UI 테마 설정
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // 파란색
    },
    secondary: {
      main: '#dc004e', // 빨간색
    },
    background: {
      default: '#f5f5f5', // 연한 회색 배경
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    // 버튼 스타일 커스터마이징
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // 버튼 텍스트 대문자 변환 비활성화
          borderRadius: 8,
        },
      },
    },
    // Paper 컴포넌트 스타일
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    // TextField 스타일
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
}, koKR); // 한국어 로케일 적용

// 메인 애플리케이션 컴포넌트
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* CSS 기본값 정규화 */}
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* 네비게이션 바 */}
            <Navigation />
            
            {/* 메인 콘텐츠 영역 */}
            <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
              <Routes>
                {/* 공개 라우트 */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                
                {/* 보호된 라우트 (인증 필요) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <BoardListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/board/create"
                  element={
                    <ProtectedRoute>
                      <BoardFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/board/edit/:id"
                  element={
                    <ProtectedRoute>
                      <BoardFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/board/:id"
                  element={
                    <ProtectedRoute>
                      <BoardDetailPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* 기본 라우트 리다이렉트 */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* 404 페이지 (모든 라우트가 매치되지 않을 때) */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;