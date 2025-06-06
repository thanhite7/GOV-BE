# GOV Project - Backend (Node.js + Docker)

## 1. Cài đặt và build Docker image cho backend

```bash
cd server
# Build Docker image
docker build -t gov-backend .
```

## 2. Chạy unit test

### 2.1. Chạy test bằng Docker
```bash
docker run --rm gov-backend npm test
```

### 2.2. Chạy test trên máy local (không dùng Docker)
```bash
npm install
npm test
```

- Script test đã được định nghĩa trong `package.json`:
  ```json
  "scripts": {
    ...existing code...
    "test": "jest"
  }
  ```

---

## 3. Chạy backend server bằng Docker

```bash
docker run -p 3000:3000 --env-file .env gov-backend
```
- Ứng dụng sẽ chạy ở `http://localhost:3000` (hoặc public IP EC2 nếu deploy).
- Đảm bảo đã cấu hình biến môi trường kết nối database trong file `.env`.

---

## 4. Tóm tắt
- Backend: Docker hóa, có thể test và chạy trên local hoặc EC2.
- Để test: dùng `docker run ... npm test` hoặc `npm test` trên local.
- Để chạy: dùng `docker run -p 3000:3000 --env-file .env gov-backend`.

---

Nếu cần ví dụ file `.env` hoặc hướng dẫn chi tiết hơn, hãy liên hệ!
