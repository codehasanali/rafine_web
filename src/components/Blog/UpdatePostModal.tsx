import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Select, Upload, Switch, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { blogAPI } from '../../services/api';

interface UpdatePostModalProps {
    visible: boolean;
    post: any;
    onCancel: () => void;
    onSuccess: () => void;
}

const UpdatePostModal: React.FC<UpdatePostModalProps> = ({
    visible,
    post,
    onCancel,
    onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (visible) {
            fetchCategories();
            form.setFieldsValue({
                title: post.title,
                content: post.content,
                categoryId: post.categoryId,
                published: post.published
            });
        }
    }, [visible, post, form]);

    const fetchCategories = async () => {
        try {
            const data = await blogAPI.getCategories();
            setCategories(data);
        } catch (error: any) {
            message.error('Kategoriler yüklenirken hata oluştu');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('content', values.content);
            formData.append('categoryId', values.categoryId);
            formData.append('published', values.published.toString());

            if (imageFile) {
                formData.append('image', imageFile);
            }

            await blogAPI.updatePost(post.id, formData);
            message.success('Blog yazısı başarıyla güncellendi');
            onSuccess();
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Blog Yazısını Düzenle"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="title"
                    label="Başlık"
                    rules={[{ required: true, message: 'Lütfen başlık girin' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="categoryId"
                    label="Kategori"
                    rules={[{ required: true, message: 'Lütfen kategori seçin' }]}
                >
                    <Select>
                        {categories.map(category => (
                            <Select.Option key={category.id} value={category.id}>
                                {category.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="content"
                    label="İçerik"
                    rules={[{ required: true, message: 'Lütfen içerik girin' }]}
                >
                    <Input.TextArea rows={10} />
                </Form.Item>

                {post.image && (
                    <Form.Item label="Mevcut Görsel">
                        <Image
                            src={post.image}
                            alt="Blog görseli"
                            style={{ maxWidth: '200px' }}
                        />
                    </Form.Item>
                )}

                <Form.Item label="Yeni Görsel">
                    <Upload
                        beforeUpload={(file) => {
                            setImageFile(file);
                            return false;
                        }}
                        onRemove={() => setImageFile(null)}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />}>Görsel Seç</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    name="published"
                    label="Yayınla"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Güncelle
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdatePostModal;