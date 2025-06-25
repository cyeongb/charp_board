import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBackOutlined,
  EditOutlined,
  DeleteOutlined,
  VisibilityOutlined,
  PersonOutlined,
  CalendarTodayOutlined,
} from '@mui/icons-material';
import type { Board } from '../types';
import { boardAPI } from '../services/api';

// 게시글 상세 페이지 컴포넌트
const BoardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 상태 관리
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  // 게시글 상세 조회
  const fetchBoard = async () => {
    if (!id) {
      setError('게시글 ID가 없습니다.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await boardAPI.getBoard(parseInt(id));
      
      if (response.success && response.data) {
        setBoard(response.data);
      } else {
        setError(response.message || '게시글을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 게시글 삭제
  const handleDelete = async () => {
    if (!board) return;

    try {
      setDeleting(true);
      const response = await boardAPI.deleteBoard(board.id);
      
      if (response.success) {
        navigate('/dashboard', { 
          state: { message: '게시글이 성공적으로 삭제되었습니다.' }
        });
      } else {
        setError(response.message || '게시글 삭제에 실패했습니다.');
      }
    } catch (error) {
      setError('게시글 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // 컴포넌트 마운트 시 게시글 조회
  useEffect(() => {
    fetchBoard();
  }, [id]);

  // 로딩 중
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>게시글을 불러오는 중...</Typography>
      </Container>
    );
  }

  // 오류 발생
  if (error || !board) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || '게시글을 찾을 수 없습니다.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate('/dashboard')}
        >
          목록으로 돌아가기
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* 상단 액션 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate('/dashboard')}
        >
          목록으로
        </Button>
        
        {/* 수정/삭제 버튼 (작성자만) */}
        {board.canEdit && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditOutlined />}
              onClick={() => navigate(`/board/edit/${board.id}`)}
            >
              수정
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlined />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              삭제
            </Button>
          </Box>
        )}
      </Box>

      {/* 게시글 내용 */}
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* 제목 */}
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
          {board.title}
        </Typography>

        {/* 메타 정보 */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Chip
            icon={<PersonOutlined />}
            label={`작성자: ${board.authorName}`}
            variant="outlined"
            color="primary"
          />
          <Chip
            icon={<CalendarTodayOutlined />}
            label={`작성일: ${new Date(board.createdAt).toLocaleDateString('ko-KR')}`}
            variant="outlined"
          />
          <Chip
            icon={<VisibilityOutlined />}
            label={`조회수: ${board.viewCount}`}
            variant="outlined"
          />
          {board.createdAt !== board.updatedAt && (
            <Chip
              label={`수정일: ${new Date(board.updatedAt).toLocaleDateString('ko-KR')}`}
              variant="outlined"
              color="secondary"
            />
          )}
        </Box>

        {/* 본문 */}
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="body1"
            component="div"
            sx={{
              lineHeight: 1.8,
              fontSize: '1.1rem',
              whiteSpace: 'pre-wrap', // 줄바꿈 유지
            }}
          >
            {board.content}
          </Typography>
        </Box>
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>게시글 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 이 게시글을 삭제하시겠습니까?
            <br />
            삭제된 게시글은 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            취소
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deleting}
            variant="contained"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BoardDetailPage;