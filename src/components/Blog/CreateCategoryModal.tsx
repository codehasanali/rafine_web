import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { blogAPI } from '../../services/api';


interface CreateCategoryModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
    visible,
    onCancel,
    onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            await blogAPI.createCategory(values);
            message.success('Kategori başarıyla oluşturuldu');
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Yeni Kategori Oluştur"
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="name"
                    label="Kategori Adı"
                    rules={[{ required: true, message: 'Lütfen kategori adı girin' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Açıklama"
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Oluştur
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateCategoryModal;