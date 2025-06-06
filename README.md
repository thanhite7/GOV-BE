# GOV Project - Dockerized Backend (Node.js + Unit Test)

## 1. Build Docker Image for Backend

```bash
cd server
docker build -t gov-backend .
```

## 2. Run Unit Tests in Docker

You can run unit tests inside a container using the same image:

```bash
docker run --rm gov-backend npm test
```

Or, for more control, you can override the CMD:

```bash
docker run --rm gov-backend npm run test
```

## 2.1. Run Unit Tests (Local, Not Docker)

Bạn có thể chạy test trực tiếp trên máy local (yêu cầu đã cài Node.js và các package):

```bash
npm test
```

Hoặc:

```bash
npm run test
```

- Script test đã được định nghĩa trong `package.json`:
  ```json
  "scripts": {
    ...existing code...
    "test": "jest"
  }
  ```

- Nếu cần build lại trước khi test (tuỳ vào cấu hình Jest), bạn có thể chạy:
  ```bash
  npm run build && npm test
  ```

---

## 3. Run Backend Server in Docker

```bash
docker run -p 3000:3000 gov-backend
```

- The backend will be available at `http://localhost:3000` (or your EC2 public IP if deployed).
- Make sure your database (MongoDB, etc.) is accessible from the container. You may need to set environment variables for DB connection (see below).

## 4. Environment Variables (Optional)

If your backend uses environment variables (e.g., for DB connection), you can pass them with `-e` or use a `.env` file:

```bash
docker run -p 3000:3000 -e MONGODB_URI=your_mongo_uri gov-backend
```

Or add this to your Dockerfile if you use dotenv:
```
COPY .env .
```

## 5. Deploy Backend to EC2

1. **Copy your Docker image or source code to EC2** (via `scp`, `git clone`, or build image on EC2).
2. **Install Docker** (if not already):
   ```bash
   sudo apt update && sudo apt install -y docker.io
   sudo systemctl start docker
   sudo systemctl enable docker
   ```
3. **Build and run as above**.
4. **Open port 3000** in your EC2 security group for public access.

---

## 6. (Optional) Frontend
- Build frontend with `npm run build` in `client/`.
- Deploy static files in `client/dist/` to S3 + CloudFront (see AWS docs for details).

---

## 7. Summary
- Backend: Dockerized, testable, and ready for EC2.
- Frontend: React, unit testable, deployable to S3/CloudFront.

---

**Contact:** If you need a sample `.env` or more deployment automation, let me know!
