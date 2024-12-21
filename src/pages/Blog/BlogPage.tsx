import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Modal, Tag, Tabs } from 'antd';
import { blogAPI } from '../../services/api';
import CreatePostModal from '../../components/Blog/CreatePostModal';
import UpdatePostModal from '../../components/Blog/UpdatePostModal';
import CreateCategoryModal from '../../components/Blog/CreateCategoryModal';
import { formatDate } from '../../utils/dateFormatter';

const BlogPage: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await blogAPI.getPosts();
            // Transform image URLs to include full server URL
            const transformedData = data.map((post: any) => ({
                ...post,
                image: post.image ? `http://77.90.53.5:3000${post.image}` : post.image
            }));
            setPosts(transformedData);
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await blogAPI.getCategories();
            setCategories(data);
        } catch (error: any) {
            message.error(error.message);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, []);


    const handleDeletePost = async (id: string) => {
        try {
            await blogAPI.deletePost(id);
            message.success('Blog yazısı başarıyla silindi');
            fetchPosts();
        } catch (error: any) {
            message.error(error.message);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            await blogAPI.deleteCategory(id);
            message.success('Kategori başarıyla silindi');
            fetchCategories();
        } catch (error: any) {
            message.error(error.message);
        }
    };

    const postColumns = [
        {
            title: 'Başlık',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Kategori',
            dataIndex: ['category', 'name'],
            key: 'category',
            render: (text: string) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Yayın Durumu',
            dataIndex: 'published',
            key: 'published',
            render: (published: boolean) => (
                <Tag color={published ? 'green' : 'orange'}>
                    {published ? 'Yayında' : 'Taslak'}
                </Tag>
            )
        },
        {
            title: 'Oluşturulma Tarihi',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => formatDate(date)
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            setSelectedPost(record);
                            setIsUpdateModalVisible(true);
                        }}
                    >
                        Düzenle
                    </Button>
                    <Button
                        danger
                        onClick={() => Modal.confirm({
                            title: 'Blog yazısını silmek istediğinize emin misiniz?',
                            content: 'Bu işlem geri alınamaz.',
                            okText: 'Evet',
                            cancelText: 'Hayır',
                            onOk: () => handleDeletePost(record.id)
                        })}
                    >
                        Sil
                    </Button>
                </Space>
            )
        }
    ];

    const categoryColumns = [
        {
            title: 'Kategori Adı',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Açıklama',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Blog Sayısı',
            dataIndex: ['_count', 'posts'],
            key: 'postCount',
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button
                    danger
                    onClick={() => Modal.confirm({
                        title: 'Kategoriyi silmek istediğinize emin misiniz?',
                        content: 'Bu kategoriye ait tüm blog yazıları da silinecektir. Bu işlem geri alınamaz.',
                        okText: 'Evet',
                        cancelText: 'Hayır',
                        onOk: () => handleDeleteCategory(record.id)
                    })}
                >
                    Sil
                </Button>
            )
        }
    ];

    const items = [
        {
            key: '1',
            label: 'Blog Yazıları',
            children: (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Button
                            type="primary"
                            onClick={() => setIsCreateModalVisible(true)}
                        >
                            Yeni Blog Yazısı
                        </Button>
                    </div>
                    <Table
                        columns={postColumns}
                        dataSource={posts}
                        rowKey="id"
                        loading={loading}
                    />
                </>
            )
        },
        {
            key: '2',
            label: 'Kategoriler',
            children: (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Button
                            type="primary"
                            onClick={() => setIsCategoryModalVisible(true)}
                        >
                            Yeni Kategori
                        </Button>
                    </div>
                    <Table
                        columns={categoryColumns}
                        dataSource={categories}
                        rowKey="id"
                    />
                </>
            )
        }
    ];

    return (
        <div>
            <Tabs items={items} />

            <CreatePostModal
                visible={isCreateModalVisible}
                onCancel={() => setIsCreateModalVisible(false)}
                onSuccess={() => {
                    setIsCreateModalVisible(false);
                    fetchPosts();
                }}
            />

            {selectedPost && (
                <UpdatePostModal
                    visible={isUpdateModalVisible}
                    post={selectedPost}
                    onCancel={() => {
                        setIsUpdateModalVisible(false);
                        setSelectedPost(null);
                    }}
                    onSuccess={() => {
                        setIsUpdateModalVisible(false);
                        setSelectedPost(null);
                        fetchPosts();
                    }}
                />
            )}

            <CreateCategoryModal
                visible={isCategoryModalVisible}
                onCancel={() => setIsCategoryModalVisible(false)}
                onSuccess={() => {
                    setIsCategoryModalVisible(false);
                    fetchCategories();
                }}
            />
        </div>
    );
};

export default BlogPage;