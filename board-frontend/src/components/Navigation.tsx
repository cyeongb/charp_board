import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  AccountCircleOutlined,
  DashboardOutlined,
  CreateOutlined,
  LogoutOutlined,
} from '@mui/icons-material';
import { useAuth } from './AuthContext';

// 네비게이션 컴포넌트
const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  
  // 사용자 메뉴 상태
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // 사용자 메뉴 열기
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // 사용자 메뉴 닫기
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 로그아웃 처리
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  // 현재 페이지 확인 함수
  const isCurrentPage = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        {/* 로고/제목 */}
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        >
          <DashboardOutlined />
          간단한 게시판
        </Typography>

        {/* 인증된 사용자용 메뉴 */}
        {isAuthenticated && user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* 대시보드 버튼 */}
            <Button
              color="inherit"
              startIcon={<DashboardOutlined />}
              onClick={() => navigate('/dashboard')}
              variant={isCurrentPage('/dashboard') ? 'outlined' : 'text'}
            >
              게시판
            </Button>

            {/* 글쓰기 버튼 */}
            <Button
              color="inherit"
              startIcon={<CreateOutlined />}
              onClick={() => navigate('/board/create')}
              variant={isCurrentPage('/board/create') ? 'outlined' : 'text'}
            >
              글쓰기
            </Button>

            {/* 사용자 메뉴 */}
            <IconButton
              onClick={handleMenuClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            {/* 사용자 드롭다운 메뉴 */}
            <Menu
              anchorEl={anchorEl}
              id="user-menu"
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* 사용자 정보 표시 */}
              <MenuItem disabled>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </MenuItem>

              {/* 로그아웃 */}
              <MenuItem onClick={handleLogout}>
                <LogoutOutlined sx={{ mr: 2 }} />
                로그아웃
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          /* 비인증 사용자용 메뉴 */
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              variant={isCurrentPage('/login') ? 'outlined' : 'text'}
            >
              로그인
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/register')}
              variant={isCurrentPage('/register') ? 'outlined' : 'text'}
            >
              회원가입
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;