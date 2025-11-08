# Tính năng Trợ lý AI HUIT

## 📌 Tổng quan

Tính năng Trợ lý AI HUIT được tích hợp vào hệ thống AdvisorSystem, cung cấp khả năng:

- 🤖 Chat với AI để hỗ trợ trả lời câu hỏi
- 📚 Tìm kiếm thông tin trong tài liệu (RAG - Retrieval Augmented Generation)
- 🛒 Tìm kiếm sản phẩm trong database
- 📄 Quản lý tài liệu vector database

## 🎯 Chức năng

### 1. Trợ lý AI Chat

- **Đường dẫn**: `/admin/rag` (tab "Trợ lý AI")
- **Tính năng**:
  - Chat tương tác với AI
  - Hỗ trợ tìm kiếm tài liệu
  - Hiển thị kết quả với Markdown formatting
  - Lưu lịch sử hội thoại (thread_id)
  - Cài đặt tùy chỉnh (số kết quả, ngưỡng tương đồng)

### 2. Quản lý Tài liệu

- **Đường dẫn**: `/admin/rag` (tab "Quản lý tài liệu")
- **Tính năng**:
  - Upload tài liệu (PDF, TXT, DOCX, CSV, XLSX, XLS)
  - Xem danh sách tài liệu
  - Chỉnh sửa metadata
  - Xóa tài liệu
  - Thống kê (tổng số, dung lượng, trạng thái)

## 🏗️ Cấu trúc File

```
src/
├── pages/admin/rag/
│   ├── RAGMain.jsx                 # Trang chính với Tabs
│   ├── RAGChatAssistant.jsx        # Component chat với AI
│   ├── RAGDocumentManagement.jsx   # Component quản lý tài liệu
│   └── RAGStyles.css               # Styles cho markdown & animation
├── services/
│   └── rag.service.js              # API calls đến RAG backend
└── components/layout/
    └── AdvisorSidebar.jsx          # Menu item "Trợ lý HUIT"
```

## 🔌 API Endpoints

### Backend RAG Service

- **Base URL**: `http://localhost:3636`
- **Endpoints**:
  - `POST /documents/vector/add` - Upload tài liệu
  - `GET /documents/list` - Lấy danh sách tài liệu
  - `GET /documents/vector/{doc_id}` - Chi tiết tài liệu
  - `PUT /documents/vector/{doc_id}` - Cập nhật tài liệu
  - `DELETE /documents/vector/{doc_id}` - Xóa tài liệu
  - `POST /documents/vector/search` - Tìm kiếm vector
  - `POST /documents/vector/search-with-llm` - Tìm kiếm với LLM
  - `POST /documents/vector/process-query` - Xử lý query với Agent

## 🚀 Cài đặt

### 1. Cài đặt Dependencies

```bash
cd FE/UngDung
npm install react-markdown
```

### 2. Cấu hình RAG Backend

Đảm bảo RAG backend đang chạy tại `http://localhost:3636`

### 3. Cấu hình Token

Token được tự động lấy từ localStorage (`access_token`) và gửi kèm trong header.

## 💻 Sử dụng

### 1. Truy cập Trợ lý AI

1. Đăng nhập với tài khoản Advisor
2. Click vào menu "Trợ lý HUIT" (icon Robot màu xanh lá)
3. Chọn tab "Trợ lý AI" để chat hoặc "Quản lý tài liệu" để quản lý

### 2. Upload Tài liệu

1. Vào tab "Quản lý tài liệu"
2. Click "Upload tài liệu"
3. Chọn file (< 50MB)
4. Nhập tên người upload
5. Click "Upload"

### 3. Chat với AI

1. Vào tab "Trợ lý AI"
2. Nhập câu hỏi vào ô input
3. Nhấn Enter hoặc click "Gửi"
4. Xem kết quả (có thể là tài liệu, sản phẩm, hoặc câu trả lời trực tiếp)

### 4. Cài đặt nâng cao

1. Click icon "Cài đặt" ở góc trên bên phải
2. Chọn chế độ tìm kiếm (Tự động/Tài liệu/Database)
3. Điều chỉnh số kết quả (k) và ngưỡng tương đồng

## 🎨 Giao diện

### Layout

- Sử dụng `AdvisorLayout` để nhất quán với các trang khác
- Responsive với mobile và desktop
- Sidebar có thể thu gọn

### Components

- **Statistics Cards**: Hiển thị thống kê tổng quan
- **Table**: Danh sách tài liệu với filter và search
- **Chat Interface**: Giao diện chat với markdown support
- **Modals**: Upload và Edit form

### Colors

- **Primary**: Blue (#1890ff) - Actions, Links
- **Success**: Green (#52c41a) - Active status, AI avatar
- **Warning**: Orange (#fa8c16) - Alerts
- **Danger**: Red (#ff4d4f) - Delete actions
- **Info**: Indigo - Gradients

## 🔧 Troubleshooting

### 1. Lỗi kết nối RAG backend

```
Error: Network Error
```

**Giải pháp**:

- Kiểm tra RAG backend có đang chạy tại `http://localhost:3636`
- Kiểm tra CORS configuration

### 2. Lỗi upload file

```
Error: File format không hỗ trợ
```

**Giải pháp**:

- Chỉ upload file: PDF, TXT, DOCX, CSV, XLSX, XLS
- File phải < 50MB

### 3. Lỗi token

```
Error: 401 Unauthorized
```

**Giải pháp**:

- Đăng xuất và đăng nhập lại
- Kiểm tra localStorage có `access_token`

## 📝 Notes

### Best Practices

1. **Upload tài liệu**:

   - Đặt tên file rõ ràng, không dấu
   - File < 50MB để tránh timeout
   - Sử dụng PDF OCR-enabled cho scan documents

2. **Chat với AI**:

   - Câu hỏi ngắn gọn, rõ ràng (5-15 từ)
   - Sử dụng thread_id để duy trì ngữ cảnh
   - Kiểm tra search_type trong response

3. **Quản lý tài liệu**:
   - Backup trước khi update/delete
   - Sử dụng force_re_embed=true sau khi sửa nội dung
   - Không thêm extension vào filename khi edit

## 🔐 Security

- Token được lưu trong localStorage
- Mọi API call đều yêu cầu authentication
- File upload được validate ở cả client và server

## 📚 Dependencies

```json
{
  "react-markdown": "^9.x",
  "antd": "^5.x",
  "axios": "^1.x",
  "lucide-react": "^0.x"
}
```

## 🎯 Future Enhancements

- [ ] Hỗ trợ upload nhiều file cùng lúc
- [ ] Preview file trước khi upload
- [ ] Export chat history
- [ ] Voice input cho chat
- [ ] Folder organization cho documents
- [ ] Advanced search filters
- [ ] Document versioning
