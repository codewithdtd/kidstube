# KidsTube Backend (Spring Boot 3 + PostgreSQL)

## 📌 Tổng quan
Phân hệ Backend cung cấp RESTful API cho ứng dụng xem video trẻ em **KidsTube**, bao gồm xác thực phụ huynh, quản lý mã PIN kiểm soát, danh mục & video thiếu nhi, theo dõi lịch sử và giới hạn thời gian xem.

## 🛠️ Công nghệ cốt lõi
- **Ngôn ngữ:** Java 17 / 21
- **Framework:** Spring Boot 3.3+ (Spring Web, Spring Data JPA, Spring Security, Validation)
- **Cơ sở dữ liệu:** PostgreSQL 16 trên Neon Serverless (`neon.tech`) & Docker Compose local
- **Database Migration:** Flyway (`V1__...sql`)
- **Tài liệu API:** Springdoc OpenAPI (Swagger UI)

## 🚀 Hướng dẫn cấu hình môi trường
1. Tạo một bản sao từ file cấu hình mẫu:
   ```bash
   cp .env.example .env
   ```
2. Điền thông tin chuỗi kết nối Neon Postgres thật vào file `.env`.
3. Khởi động ứng dụng bằng Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
4. Truy cập kiểm tra trạng thái sức khỏe:
   - Healthcheck: `http://localhost:8080/actuator/health`
