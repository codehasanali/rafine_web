import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, message, Popconfirm } from 'antd';
import { categoryAPI, menuAPI } from '../../services/api';

interface DeleteCategoryModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
    visible,
    onCancel,
    onSuccess
}) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const fetchedCategories = await menuAPI.getCategories();
            setCategories(fetchedCategories);
        } catch (error: any) {
            message.error('Kategoriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchCategories();
        }
    }, [visible]);

    const handleDelete = async (category: any) => {
        try {
            await categoryAPI.deleteCategory(category.id);
            message.success('Kategori başarıyla silindi');
            fetchCategories();
            onSuccess();
        } catch (error: any) {
            message.error(error.message || 'Kategori silinirken bir hata oluştu');
        }
    };

    const columns = [
        {
            title: 'Kategori Adı',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_: any, record: any) => (
                <Popconfirm
                    title="Bu kategoriyi silmek istediğinizden emin misiniz?"
                    description="Bu işlem geri alınamaz ve kategoriye ait tüm ürünler silinecektir!"
                    onConfirm={() => handleDelete(record)}
                    okText="Evet"
                    cancelText="Hayır"
                >
                    <Button danger>Sil</Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <Modal
            title="Kategori Sil"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            <Table
                columns={columns}
                dataSource={categories}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 5 }}
            />
        </Modal>
    );
};

export default DeleteCategoryModal;