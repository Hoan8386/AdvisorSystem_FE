import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdvisorLayout } from '../../../components/layout/AdvisorLayout';
import { Card, Form, Input, Button, Select, Space } from 'antd';
import { toast } from 'react-toastify';
import { createMonitoringNoteAPI, updateMonitoringNoteAPI } from '../../../services/pointFeedback.service';

function CreateEditMonitoringNote() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = location.pathname.includes('/edit');
  const noteId = location.pathname.split('/')[3];

  useEffect(() => {
    if (isEdit && location.state?.note) {
      const note = location.state.note;
      form.setFieldsValue({
        student_id: note.student_id,
        semester_id: note.semester_id,
        category: note.category,
        title: note.title,
        content: note.content,
      });
    }
  }, [isEdit, location.state, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateMonitoringNoteAPI(noteId, values);
        toast.success('Cập nhật ghi chú thành công');
      } else {
        await createMonitoringNoteAPI(values);
        toast.success('Tạo ghi chú thành công');
      }
      navigate('/advisor/monitoring-notes');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdvisorLayout>
      <div className='p-6'>
        <Card>
          <h1 className='text-2xl font-bold mb-6'>{isEdit ? 'Chỉnh sửa ghi chú' : 'Tạo ghi chú mới'}</h1>
          <Form form={form} layout='vertical' onFinish={handleSubmit} className='max-w-2xl'>
            <Form.Item label='Sinh viên' name='student_id' rules={[{ required: true, message: 'Chọn sinh viên' }]}>
              <Select placeholder='Chọn sinh viên' disabled={isEdit} options={[{ label: 'SV001', value: 1 }]} />
            </Form.Item>
            <Form.Item label='Học kỳ' name='semester_id' rules={[{ required: true, message: 'Chọn học kỳ' }]}>
              <Select placeholder='Chọn học kỳ' options={[{ label: 'HK1 - 2024-2025', value: 1 }, { label: 'HK2 - 2024-2025', value: 2 }]} />
            </Form.Item>
            <Form.Item label='Danh mục' name='category' rules={[{ required: true, message: 'Chọn danh mục' }]}>
              <Select placeholder='Chọn danh mục' options={[{ label: 'Học tập', value: 'academic' }, { label: 'Cá nhân', value: 'personal' }, { label: 'Chuyên cần', value: 'attendance' }, { label: 'Khác', value: 'other' }]} />
            </Form.Item>
            <Form.Item label='Tiêu đề' name='title' rules={[{ required: true, message: 'Nhập tiêu đề' }, { min: 5, message: 'Tối thiểu 5 ký tự' }, { max: 255, message: 'Tối đa 255 ký tự' }]}>
              <Input placeholder='Nhập tiêu đề' />
            </Form.Item>
            <Form.Item label='Nội dung' name='content' rules={[{ required: true, message: 'Nhập nội dung' }, { min: 10, message: 'Tối thiểu 10 ký tự' }, { max: 5000, message: 'Tối đa 5000 ký tự' }]}>
              <Input.TextArea rows={8} placeholder='Nhập nội dung ghi chú' />
            </Form.Item>
            <Space>
              <Button type='primary' htmlType='submit' loading={loading}>
                {isEdit ? 'Cập nhật' : 'Tạo'}
              </Button>
              <Button onClick={() => navigate('/advisor/monitoring-notes')}>
                Hủy
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </AdvisorLayout>
  );
}

export default CreateEditMonitoringNote;
