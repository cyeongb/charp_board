import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Paper,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBackOutlined,
  SaveOutlined,
  EditNoteOutlined,
  CreateOutlined,
} from '@mui/icons-material';
import type { Board, BoardRequest } from '../types';
import { boardAPI } from '../services/api';

// 게시글 작성/수정 페이지 컴포넌트
const BoardFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id); // 수정 모드인지 확인
  
  // 폼 상태 관리
  const [formData, setFormData] = useState<BoardRequest>({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // 기존 게시글 데이터 로드 (수정 모드인 경우)
  const loadBoard = async () => {
    if (!isEdit || !id) return;

    try {
      setLoading(true);
      const response = await boardAPI.getBoard(parseInt(id));
      
      if (response.success && response.data) {
        const board = response.data;
        
        // 작성자가 아닌 경우 수정 불가
        if (!board.canEdit) {
          setError('이 게시글을 수정할 권한이 없습니다.');
          return;
        }
        
        setFormData({
          title: board.title,
          content: board.content,
        });
      } else {
        setError(response.message || '게시글을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 기존 게시글 로드
  useEffect(() => {
    loadBoard();
  }, [id, isEdit]);

  // 입력 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return false;
    }
    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return false;
    }
    return true;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let response;
      
      if (isEdit && id) {
        // 수정 모드
        response = await boardAPI.updateBoard(parseInt(id), formData);
      } else {
        // 작성 모드
        response = await boardAPI.createBoard(formData);
      }

      if (response.success && response.data) {
        setSuccess(
          isEdit 
            ? '게시글이 성공적으로 수정되었습니다.' 
            : '게시글이 성공적으로 작성되었습니다.'
        );
        
        // 성공 시 상세 페이지로 이동
        setTimeout(() => {
          navigate(`/board/${response.data!.id}`);
        }, 1500);
      } else {
        setError(response.message || '게시글 저장에 실패했습니다.');
      }
    } catch (error) {
      setError('게시글 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isEdit ? (
            <EditNoteOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
          ) : (
            <CreateOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
          )}
          <Typography variant="h4" component="h1">
            {isEdit ? '게시글 수정' : '게시글 작성'}
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate('/dashboard')}
        >
          목록으로
        </Button>
      </Box>

      {/* 오류/성공 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* 게시글 작성/수정 폼 */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* 제목 입력 */}
          <TextField
            fullWidth
            required
            label="제목"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
            placeholder="게시글 제목을 입력하세요"
            sx={{ mb: 3 }}
            inputProps={{ maxLength: 200 }}
            helperText={`${formData.title.length}/200`}
          />

          {/* 내용 입력 */}
          <TextField
            fullWidth
            required
            label="내용"
            name="content"
            value={formData.content}
            onChange={handleChange}
            disabled={loading}
            placeholder="게시글 내용을 입력하세요"
            multiline
            rows={15}
            sx={{ mb: 3 }}
            helperText="내용을 자세히 작성해주세요"
          />

          {/* 제출 버튼 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              취소
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveOutlined />}
              disabled={loading}
            >
              {loading 
                ? (isEdit ? '수정 중...' : '작성 중...') 
                : (isEdit ? '수정하기' : '작성하기')
              }
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BoardFormPage;