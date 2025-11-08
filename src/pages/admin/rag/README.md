# 🤖 Trợ lý HUIT - Hệ thống RAG AI Assistant

## 📋 Tổng quan

Trợ lý HUIT là hệ thống AI Assistant thông minh sử dụng công nghệ RAG (Retrieval-Augmented Generation) để:

- 🔍 Tìm kiếm thông tin trong tài liệu
- 💬 Trả lời câu hỏi tự nhiên
- 📚 Quản lý tài liệu vector database
- 🛒 Tích hợp tìm kiếm database

## 🚀 Tính năng chính

### 1. Trợ lý AI Chat

- **Đa chế độ tìm kiếm**: Tự động, RAG (tài liệu), Database
- **Hội thoại thông minh**: Duy trì ngữ cảnh conversation với thread_id
- **Hiển thị kết quả đa dạng**:
  - Câu trả lời text với Markdown
  - Danh sách sản phẩm với hình ảnh
  - Thông tin tài liệu với độ tương đồng
- **Cài đặt nâng cao**:
  - Số lượng kết quả (k): 1-10
  - Ngưỡng độ tương đồng: 0-1
  - Lựa chọn chế độ tìm kiếm

### 2. Quản lý tài liệu

- **Upload tài liệu**: PDF, TXT, DOCX, CSV, XLS, XLSX (< 50MB)
- **Chỉnh sửa metadata**: Tên file, người upload
- **Xóa tài liệu**: Xóa file, metadata và vector embeddings
- **Thống kê**: Tổng số tài liệu, dung lượng, trạng thái
- **Tái tạo embeddings**: Force re-embed khi cần

## 🛠️ Cấu hình

### Environment Variables

```env
# Backend RAG Service
VITE_RAG_API_URL=http://localhost:3636

# Google API for Embeddings
GOOGLE_API_KEY=your_google_api_key
```

### Cấu hình Backend

File: `RAG-Test/.env`

```env
GOOGLE_API_KEY=your_google_api_key
DATABASE_URL=mongodb://admin:123@mongo:27017/
DATA_PATH=Root_Folder
VECTOR_DB_PATH=vectorstore
JWT_SECRET_KEY=your-secret-key
```

## 📖 Hướng dẫn sử dụng

### Upload tài liệu mới

1. Vào tab **"Quản lý tài liệu"**
2. Click nút **"Upload tài liệu"**
3. Chọn file (hỗ trợ: PDF, TXT, DOCX, CSV, XLS, XLSX)
4. Nhập tên người upload
5. Click **"Upload"**

⚠️ **Lưu ý**:

- File phải < 50MB
- Tên file không nên có dấu tiếng Việt
- Quá trình embedding có thể mất vài giây

### Sử dụng Trợ lý AI

1. Vào tab **"Trợ lý AI"**
2. Nhập câu hỏi vào ô input
3. Nhấn **Enter** hoặc click **"Gửi"**
4. Đợi AI xử lý và trả lời

**Ví dụ câu hỏi**:

- "Tìm thông tin về đề tài nghiên cứu khoa học"
- "Quy định về điểm rèn luyện là gì?"
- "Tìm pizza hải sản size lớn"
- "Hướng dẫn đăng ký hoạt động"

### Chỉnh sửa tài liệu

1. Click nút **"Chỉnh sửa"** (✏️) ở hàng tài liệu
2. Sửa tên file (không thêm extension)
3. Sửa người upload nếu cần
4. Tick **"Tạo lại embeddings"** nếu nội dung file thay đổi
5. Click **"Cập nhật"**

⚠️ **Quan trọng**:

- Không thêm phần mở rộng (.pdf, .txt) khi đổi tên
- Force re-embed sẽ tốn thời gian
- Tự động re-embed khi đổi tên file

### Xóa tài liệu

1. Click nút **"Xóa"** (🗑️) ở hàng tài liệu
2. Xác nhận trong popup
3. Hệ thống sẽ xóa:
   - File gốc
   - Metadata trong MongoDB
   - Vector embeddings trong FAISS

## 🎨 Giao diện

### Dashboard Thống kê

- **Tổng tài liệu**: Số lượng file đã upload
- **Tổng dung lượng**: Dung lượng tất cả file (MB)
- **Hoạt động tốt**: Số file có đầy đủ file + vector
- **Lỗi**: Số file bị lỗi (thiếu file hoặc vector)

### Chat Interface

- **Avatar**: User (xanh dương) vs AI (xanh lá)
- **Message Bubble**: Khác màu cho user/AI
- **Type Badge**: Hiển thị loại tìm kiếm (Database/RAG/Direct)
- **Product Cards**: Hiển thị sản phẩm với hình ảnh, giá, stock
- **Markdown Support**: Bold, italic, list, code, blockquote

## 🔧 Troubleshooting

### Lỗi: "Upload thất bại"

**Nguyên nhân**:

- File quá lớn (> 50MB)
- Format không hỗ trợ
- Backend RAG service không hoạt động

**Giải pháp**:

1. Kiểm tra kích thước file
2. Đảm bảo file đúng format
3. Kiểm tra RAG service: `http://localhost:3636/health`

### Lỗi: "Không thể tải danh sách tài liệu"

**Nguyên nhân**:

- MongoDB không kết nối được
- Token authentication thất bại

**Giải pháp**:

1. Kiểm tra MongoDB: `docker ps | grep mongo`
2. Kiểm tra token trong localStorage
3. Đăng nhập lại

### Chat không phản hồi

**Nguyên nhân**:

- RAG backend không chạy
- Google API key không hợp lệ
- Network timeout

**Giải pháp**:

1. Kiểm tra backend: `docker logs faiss-api-main`
2. Verify Google API key trong `.env`
3. Tăng timeout trong `rag.service.js`

### Embeddings bị lỗi

**Nguyên nhân**:

- Google API quota hết
- File PDF bị corrupt
- Network issue

**Giải pháp**:

1. Kiểm tra Google API quota
2. Thử upload lại file
3. Sử dụng force re-embed

## 🔐 Bảo mật

- ✅ Tất cả endpoints yêu cầu JWT authentication
- ✅ Token được lưu trong localStorage
- ✅ Interceptor tự động gắn Bearer token
- ✅ MongoDB credentials không hardcode

## 📊 Performance

- **Upload**: ~2-5s cho file 1MB (tùy embedding)
- **Search**: ~100-300ms
- **Chat với LLM**: ~2-5s
- **Delete**: ~500ms

## 🎯 Roadmap

- [ ] Hỗ trợ upload batch nhiều file
- [ ] Export conversation history
- [ ] Filter tài liệu theo file_type
- [ ] Preview file PDF trong modal
- [ ] Voice input cho chat
- [ ] Multi-language support
- [ ] Real-time collaboration

## 📞 Hỗ trợ

- **Email**: support@huit.edu.vn
- **Documentation**: README.md (RAG-Test)
- **Issues**: GitHub Issues

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 2025-11-07  
**Người phát triển**: HUIT Dev Team
