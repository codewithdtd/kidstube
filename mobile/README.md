# KidsTube Mobile (React Native + TypeScript)

## 📌 Tổng quan
Ứng dụng di động KidsTube dành cho trẻ em và phụ huynh, xây dựng trên nền tảng React Native (Expo / Bare CLI) và TypeScript.

## 👶 Trải nghiệm dành cho trẻ em (Kids Mode)
- Giao diện thân thiện, icon to rõ, màu sắc tươi vui.
- Trình phát video YouTube mượt mà, chống chạm nhầm / khóa thoát khi đang chiếu.
- Cơ chế **Local Cache-First** (MMKV): Tải danh sách video tức thì dưới 0.1 giây, loại bỏ hoàn toàn cảm nhận trễ cold-start từ server.
- Giới hạn thời gian xem (Screen Time Timer) với màn hình nhắc nhở hoạt hình khi hết giờ.

## 👨‍👩‍👧 Chế độ phụ huynh (Parent Mode)
- Bảo vệ bằng **Mã PIN 4 số** độc lập lưu an toàn trong Secure Keystore.
- Quản lý hồ sơ bé (Kid Profiles: tuổi, avatar, cài đặt thời gian xem tối đa mỗi ngày).
- Duyệt lịch sử xem và chặn/mở nội dung theo ý muốn phụ huynh.

## 🛠️ Công nghệ cốt lõi
- **Framework:** React Native (Expo SDK 51+)
- **Ngôn ngữ:** TypeScript (Strict Mode)
- **Quản lý trạng thái:** Zustand
- **Lưu trữ bảo mật:** Expo SecureStore (Mã PIN & Token) + MMKV (Offline Cache)
