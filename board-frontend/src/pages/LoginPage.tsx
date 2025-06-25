import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LoginOutlined } from '@mui/icons-material';
import { useAuth } from '../components/AuthContext';

// 로그인 페이지 컴포넌트
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // 입력 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        navigate('/dashboard'); // 로그인 성공 시 대시보드로 이동
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={6} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* 로그인 아이콘 */}
            <LoginOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            
            {/* 제목 */}
            <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
              로그인
            </Typography>

            {/* 오류 메시지 */}
            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* 로그인 폼 */}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="이메일 주소"
                name="email"
                autoComplete="email"
                autoFocus
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="비밀번호"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : undefined}
              >
                {loading ? '로그인 중...' : '로그인'}
              </Button>

              {/* 링크들 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    회원가입
                  </Typography>
                </Link>
                <Link to="/reset-password" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    비밀번호 찾기
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;