# Hướng Dẫn Sử Dụng Trang Thống Kê Cuộc Họp

## Tổng Quan

Trang **Thống Kê Cuộc Họp** cung cấp một cái nhìn toàn diện về các cuộc họp và tỷ lệ điểm danh của giáo viên cố vấn.

## Vị Trí Truy Cập

- **Đường dẫn URL**: `/advisor/meetings/statistics`
- **Nút truy cập**: Trang danh sách cuộc họp (`/advisor/meetings`) → Nút "Thống kê" (BarChartOutlined)

## Chức Năng

### 1. Tổng Quan Cuộc Họp

Hiển thị 4 chỉ số chính về tất cả các cuộc họp:

| Chỉ Số            | Mô Tả                                                               |
| ----------------- | ------------------------------------------------------------------- |
| **Tổng Cuộc Họp** | Số lượng tất cả các cuộc họp trong hệ thống                         |
| **Đã Lên Lịch**   | Số cuộc họp đã được lên lịch nhưng chưa diễn ra (status: scheduled) |
| **Hoàn Thành**    | Số cuộc họp đã kết thúc (status: completed)                         |
| **Đã Hủy**        | Số cuộc họp đã bị hủy (status: cancelled)                           |

### 2. Tỷ Lệ Hoàn Thành

- Hiển thị dưới dạng biểu đồ tròn (Progress Circle)
- Tính toán: `(Số cuộc họp hoàn thành / Tổng cuộc họp) × 100%`
- Hiển thị cả dạng phần trăm và phân số

### 3. Cuộc Họp Có Biên Bản

- Hiển thị dưới dạng biểu đồ tròn
- Tính toán: `(Số cuộc họp có biên bản / Tổng cuộc họp) × 100%`
- Giúp theo dõi tỷ lệ ghi chép biên bản

### 4. Thống Kê Điểm Danh

#### Chỉ Số Chính:

| Chỉ Số                 | Mô Tả                                                 |
| ---------------------- | ----------------------------------------------------- |
| **Tổng Người Tham Dự** | Tổng số người được ghi danh trong tất cả cuộc họp     |
| **Đã Tham Dự**         | Số người đã có mặt (attended = true)                  |
| **Tỷ Lệ Tham Dự**      | Phần trăm tham dự: `(Đã tham dự / Tổng người) × 100%` |
| **Vắng Mặt**           | Số người vắng mặt: `Tổng người - Đã tham dự`          |

#### Biểu Đồ Tiến Độ (Progress Bar):

- Thanh màu gradient: Đỏ (0%) → Vàng (50%) → Xanh (100%)
- Giúp trực quan hóa tỷ lệ điểm danh

### 5. Tóm Tắt

Phần tóm tắt dưới cùng hiển thị:

- ✓ Tổng cộng X cuộc họp trong hệ thống
- ✓ X cuộc họp (Y%) đã hoàn thành
- ✓ X cuộc họp (Y%) có biên bản
- ✓ Tỷ lệ tham dự: Z% (A/B)

## Response API

API endpoint: `/api/meetings/statistics/overview`

**Response Format:**

```json
{
  "success": true,
  "data": {
    "total_meetings": 4,
    "scheduled": 1,
    "completed": 3,
    "cancelled": 0,
    "with_minutes": 2,
    "attendance": {
      "total_attendees": 26,
      "attended_count": "23",
      "attendance_rate": 88.46
    }
  }
}
```

## Các Tính Năng Bổ Sung

### Nút Làm Mới (Refresh)

- Vị trí: Góc trên phải
- Chức năng: Tải lại dữ liệu thống kê từ server

### Nút Quay Lại (Back)

- Vị trí: Góc trên trái
- Chức năng: Quay lại trang danh sách cuộc họp

### Loading State

- Hiển thị spinner khi đang tải dữ liệu
- Thông báo "Đang tải thống kê..."

### Error Handling

- Hiển thị toast notification nếu có lỗi tải dữ liệu
- Thông báo: "Không thể tải thống kê cuộc họp"

## Giao Diện

### Thiết Kế Responsive

- **Desktop**: Bố cục đầy đủ với các card theo hàng ngang
- **Tablet**: Bố cục thích ứng với số cột giảm
- **Mobile**: Bố cục dọc với các card chồng lên nhau

### Màu Sắc (Color Scheme)

| Yếu Tố             | Màu        | Mã Màu  |
| ------------------ | ---------- | ------- |
| Tổng Cuộc Họp      | Xanh dương | #1890ff |
| Đã Lên Lịch        | Cam        | #faad14 |
| Hoàn Thành         | Xanh lá    | #52c41a |
| Đã Hủy             | Đỏ         | #ff4d4f |
| Tổng Người Tham Dự | Tím        | #722ed1 |
| Đã Tham Dự         | Xanh nhạt  | #13c2c2 |
| Tỷ Lệ Tham Dự      | Hồng       | #eb2f96 |
| Vắng Mặt           | Cam đậm    | #fa8c16 |

## Hướng Dẫn Sử Dụng Từng Bước

1. **Truy cập trang danh sách cuộc họp** (`/advisor/meetings`)
2. **Nhấn nút "Thống kê"** (có icon biểu đồ cột)
3. **Chờ trang tải** (nếu cần)
4. **Xem các chỉ số thống kê**:
   - Phần tổng quan cuộc họp ở trên
   - Phần thống kê điểm danh ở dưới
5. **(Tùy chọn)** Nhấn nút "Làm mới" để cập nhật dữ liệu
6. **Nhấn nút "Back"** hoặc dùng mũi tên trở lại danh sách

## Lưu Ý Quan Trọng

- **Dữ liệu thực thời**: Dữ liệu được tải trực tiếp từ API, luôn là thông tin mới nhất
- **Tính toán tỷ lệ**: Tỷ lệ được làm tròn đến 2 chữ số thập phân
- **Xử lý trường hợp không có dữ liệu**: Nếu không có cuộc họp nào, trang sẽ hiển thị "Không có dữ liệu thống kê"

## Troubleshooting

| Vấn Đề                       | Giải Pháp                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| Trang không tải              | Nhấn F5 để làm mới hoặc kiểm tra kết nối mạng                                                    |
| Dữ liệu không chính xác      | Nhấn nút "Làm mới"                                                                               |
| Lỗi "Không thể tải thống kê" | Kiểm tra xem server có đang chạy và API endpoint `/api/meetings/statistics/overview` có sẵn sàng |
| Biểu đồ không hiển thị       | Kiểm tra xem trình duyệt có hỗ trợ SVG không                                                     |

## File Liên Quan

- **Component**: `AdvisorSystem_FE/src/pages/advisor/meetings/MeetingStatistics.jsx`
- **Service**: `AdvisorSystem_FE/src/services/meeting.service.js`
- **Route**: `AdvisorSystem_FE/src/App.jsx` (dòng 170)
- **Entry Button**: `AdvisorSystem_FE/src/pages/advisor/meetings/AdvisorMeetings.jsx` (dòng 350)

---

**Ngày tạo**: 18/11/2025
**Phiên bản**: 1.0
