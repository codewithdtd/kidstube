import { Video } from '../../../types/models';

export interface CategoryChip {
  id: number;
  label: string;
}

export const CATEGORIES: CategoryChip[] = [
  { id: 0, label: 'Tất cả' },
  { id: 1, label: 'Hoạt hình' },
  { id: 2, label: 'Âm nhạc' },
  { id: 3, label: 'Khám phá & Khoa học' },
  { id: 4, label: 'Tiếng Anh' },
  { id: 5, label: 'Mới cho bạn' },
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: 1,
    youtubeVideoId: 'dQw4w9WgXcQ',
    title: 'Bé Học Màu Sắc Cùng Quả Bóng Khổng Lồ và Những Chiếc Xe Vui Nhộn',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 684,
    categoryId: 1,
    channelTitle: 'Kids Learning TV',
    isActive: true,
  },
  {
    id: 2,
    youtubeVideoId: 'V1bFr2KGq1g',
    title: 'Thám Hiểm Thế Giới Động Vật Hoang Dã: Sư Tử, Hổ và Voi Châu Phi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 1471,
    categoryId: 3,
    channelTitle: 'National Wild Kids',
    isActive: true,
  },
  {
    id: 3,
    youtubeVideoId: 'kJQP7kiw5Fk',
    title: 'Bài Hát Về Bảng Chữ Cái ABC Cực Kỳ Vui Nhộn Dành Cho Bé',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 245,
    categoryId: 2,
    channelTitle: 'Super ABC Songs',
    isActive: true,
  },
  {
    id: 4,
    youtubeVideoId: '3JZ_D3ELwOQ',
    title: 'Thí Nghiệm Núi Lửa Phun Trào Mini Tại Nhà Dành Cho Bé Yêu Khoa Học',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 532,
    categoryId: 3,
    channelTitle: 'Khoa Học Vui',
    isActive: true,
  },
  {
    id: 5,
    youtubeVideoId: '9bZkp7q19f0',
    title: 'Chuyến Phiêu Lưu Của Chú Khủng Long Con Trong Rừng Xanh Kỳ Diệu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 1120,
    categoryId: 1,
    channelTitle: 'Thế Giới Hoạt Hình',
    isActive: true,
  },
  {
    id: 6,
    youtubeVideoId: 'OPf0YbXqDm0',
    title: 'Học Đếm Số Từ 1 Đến 20 Qua Trò Chơi Xếp Gạch Lego Đầy Màu Sắc',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 430,
    categoryId: 4,
    channelTitle: 'Đồ Chơi Sáng Tạo',
    isActive: true,
  },
  {
    id: 7,
    youtubeVideoId: 'RgKAFK5djSk',
    title: 'Giai Điệu Ru Bé Ngủ Ngon Cùng Tiếng Sóng Biển Và Đàn Piano Nhẹ Nhàng',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 1845,
    categoryId: 2,
    channelTitle: 'Âm Nhạc Cho Bé',
    isActive: true,
  },
  {
    id: 8,
    youtubeVideoId: 'libKVRa01L8',
    title: 'Khám Phá Vũ Trụ Bao La: Hệ Mặt Trời Và Các Hành Tinh Xung Quanh Trái Đất',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 890,
    categoryId: 3,
    channelTitle: 'Vũ Trụ Diệu Kỳ',
    isActive: true,
  },
];
