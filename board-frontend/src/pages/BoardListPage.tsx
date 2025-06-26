import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Paper,
} from '@mui/material';
import { DataGrid, type GridColDef, GridToolbar } from '@mui/x-data-grid';
import { AddOutlined, VisibilityOutlined, EditOutlined } from '@mui/icons-material';
import type { Board, BoardGridRow } from '../types';
import { boardAPI } from '../services/api';

// 게시판 목록 페이지 컴포넌트
const BoardListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // 게시글 목록 조회
  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await boardAPI.getBoards();
      
      if (response.success && response.data) {
        setBoards(response.data);
      } else {
        setError(response.message || '게시글을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setError(error+'게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 게시글 목록 조회
  useEffect(() => {
    fetchBoards();
  }, []);

  // DataGrid용 데이터 변환
  const rows: BoardGridRow[] = boards.map(board => ({
    id: board.id,
    title: board.title,
    authorName: board.authorName,
    createdAt: new Date(board.createdAt).toLocaleDateString('ko-KR'),
    viewCount: board.viewCount,
    canEdit: board.canEdit,
  }));

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      sortable: true,
    },
    {
      field: 'title',
      headerName: '제목',
      flex: 1,
      minWidth: 200,
      sortable: true,
      filterable: true,
    },
    {
      field: 'authorName',
      headerName: '작성자',
      width: 120,
      sortable: true,
      filterable: true,
    },
    {
      field: 'createdAt',
      headerName: '작성일',
      width: 120,
      sortable: true,
    },
    {
      field: 'viewCount',
      headerName: '조회수',
      width: 100,
      sortable: true,
      type: 'number',
    },
    {
      field: 'actions',
      headerName: '액션',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* 상세보기 버튼 */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityOutlined />}
            onClick={() => navigate(`/board/${params.row.id}`)}
          >
            보기
          </Button>
          
          {/* 수정 버튼 (작성자만) */}
          {params.row.canEdit && (
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<EditOutlined />}
              onClick={() => navigate(`/board/edit/${params.row.id}`)}
            >
              수정
            </Button>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          게시판
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => navigate('/board/create')}
        >
          글쓰기
        </Button>
      </Box>

      {/* 오류 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 게시글 목록 테이블 */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pagination
          pageSizeOptions={[5, 10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: {
              sortModel: [{ field: 'id', sort: 'desc' }], // 최신순 정렬
            },
          }}
          slots={{
            toolbar: GridToolbar, // 필터, 정렬, 엑셀 내보내기 등 기능 포함
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true, // 빠른 검색 기능
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            '& .MuiDataGrid-toolbarContainer': {
              padding: 2,
            },
          }}
        />
      </Paper>

      {/* 빈 상태 메시지 */}
      {!loading && boards.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            등록된 게시글이 없습니다.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => navigate('/board/create')}
            sx={{ mt: 2 }}
          >
            첫 번째 글 작성하기
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default BoardListPage;