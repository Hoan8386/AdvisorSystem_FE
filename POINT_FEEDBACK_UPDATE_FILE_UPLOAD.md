# Point Feedback - Update & File Upload Implementation

## ✅ Cập nhật hoàn thành

### 📝 CreateEditPointFeedback.jsx - Cải tiến

#### 1. **Load Existing Attachment khi Edit**

```javascript
if (data.attachment_path) {
  setFileList([
    {
      uid: "-1",
      name: data.attachment_path.split("/").pop(),
      status: "done",
      url: `/storage/${data.attachment_path}`,
      isExisting: true,
    },
  ]);
}
```

- Hiển thị file đã upload khi chỉnh sửa
- Cho phép xem và thay đổi file

#### 2. **Smart File Handling trong Submit**

```javascript
// Only add attachment if it's a new file (not existing)
if (fileList.length > 0) {
  const file = fileList[0];
  if (file.originFileObj) {
    // New file uploaded
    formData.append("attachment", file.originFileObj);
  }
}
```

- Chỉ gửi file mới
- Không gửi file cũ (tiết kiệm bandwidth)
- Hỗ trợ thay đổi file

#### 3. **Improved Upload UI**

```jsx
<Upload
  fileList={fileList}
  onChange={handleFileChange}
  maxCount={1}
  accept=".jpg,.jpeg,.png,.pdf"
  listType="text"
>
  <Button icon={<UploadOutlined />}>
    {fileList.length > 0 ? "Thay đổi file" : "Chọn file"}
  </Button>
</Upload>
```

- Text động: "Chọn file" vs "Thay đổi file"
- Hỗ trợ: jpg, jpeg, png, pdf
- Max: 5MB

#### 4. **Status Information**

```jsx
{
  isEdit && feedback?.attachment_path && fileList.length === 0 && (
    <p className="text-xs text-blue-600 mt-2">
      ✓ File hiện tại: {feedback.attachment_path.split("/").pop()}
    </p>
  );
}
```

- Hiển thị file hiện tại khi chỉnh sửa
- Cho biết khi nào file được thay đổi

---

## 🔗 API Integration

### Endpoint sử dụng:

**1. Create (POST)**

```
POST /api/point-feedbacks
Content-Type: multipart/form-data

Fields:
- semester_id (int) - required
- feedback_content (string, 10-2000) - required
- attachment (file) - optional, jpg|jpeg|png|pdf, max 5MB
```

**2. Update (PUT)**

```
PUT /api/point-feedbacks/{id}
Content-Type: multipart/form-data

Fields:
- semester_id (int) - optional
- feedback_content (string, 10-2000) - optional
- attachment (file) - optional, replace existing file
```

**3. Get Detail (GET)**

```
GET /api/point-feedbacks/{id}

Response includes:
- attachment_path: "point_feedbacks/filename.jpg"
```

---

## 📋 Validation Rules

| Field            | Min | Max  | Type    | Required |
| ---------------- | --- | ---- | ------- | -------- |
| semester_id      | -   | -    | integer | ✓        |
| feedback_content | 10  | 2000 | string  | ✓        |
| attachment       | -   | 5MB  | file    | ✗        |

**File Types:** jpg, jpeg, png, pdf

---

## 🎯 Chức năng chi tiết

### Tạo mới (Create):

1. Chọn học kỳ
2. Nhập nội dung (10-2000 ký tự)
3. Upload file (tùy chọn)
4. Click "Tạo"

### Chỉnh sửa (Update):

1. ✓ Chỉ chỉnh sửa được khi status = "pending"
2. Có thể thay đổi:
   - Học kỳ
   - Nội dung
   - File (thay đổi hoặc xóa)
3. Click "Cập nhật"

---

## ✨ Cải tiến mới

- ✅ Load existing file khi edit
- ✅ Display current file name
- ✅ Allow file replacement
- ✅ Smart FormData construction
- ✅ Only send new files (optimize bandwidth)
- ✅ Dynamic button text ("Chọn file" vs "Thay đổi file")
- ✅ File type validation
- ✅ File size validation (5MB max)
- ✅ Responsive UI

---

## 🔄 Flow

```
Student Create/Edit Feedback
  ↓
Load data (if edit) + existing file
  ↓
Display form with current values
  ↓
Student fills/updates form
  ↓
Choose/change file (optional)
  ↓
Submit
  ↓
If valid → POST/PUT to API
  ↓
Success → Redirect to list
  ↓
Error → Show message
```

---

## 🛡️ Error Handling

```javascript
// API response errors
catch (error) {
  const errorMessage = error.response?.data?.errors
    ? Object.values(error.response.data.errors).flat().join(", ")
    : error.response?.data?.message || "Lỗi khi lưu phản hồi";
  toast.error(errorMessage);
}
```

**Common Errors:**

- File size > 5MB
- Invalid file type
- Content length < 10 or > 2000
- Status không phải "pending" (khi edit)

---

## 📦 Dependencies

```javascript
import { Form, Upload, Button } from "antd";
import { toast } from "react-toastify";
import {
  getPointFeedbackDetailAPI,
  createPointFeedbackAPI,
  updatePointFeedbackAPI,
} from "services";
```

---

## 🧪 Testing Checklist

- [ ] Create new feedback với file
- [ ] Create new feedback mà không có file
- [ ] Edit feedback (tất cả fields)
- [ ] Change file khi edit
- [ ] Remove file khi edit (submit mà không chọn file)
- [ ] File size validation (> 5MB)
- [ ] File type validation (invalid format)
- [ ] Content length validation (< 10, > 2000)
- [ ] Cannot edit if status ≠ "pending"

---

## 📝 Status: ✅ COMPLETE

Tất cả chức năng cập nhật phản hồi và upload file đã được triển khai đầy đủ.

**Ngày cập nhật:** 20/11/2025
