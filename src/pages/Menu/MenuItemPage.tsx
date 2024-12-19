import React, { useEffect, useState, useCallback } from 'react';
import { Table, Space, Button, message, Popconfirm, Select, Tag, Modal, List } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { menuAPI, commentAPI } from '../../services/api';

import UpdateMenuModal from './UpdateMenuModal';
import CreateMenuModal from './CreateMenuModal';
import DeleteCategoryModal from '../../components/Category/DeleteCategoryModal';

const { Option } = Select;

interface MenuOption {
  id: number;
  name: string;
  price: number;
  category: string;
  isDefault: boolean;
  isRequired: boolean;
  menuItemId: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  points: number;
  description: string;
  image: string;
  category: string;
  options: MenuOption[];
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

const MenuItemPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [selectedComments, setSelectedComments] = useState<Comment[]>([]);
  const [isDeleteCategoryModalVisible, setIsDeleteCategoryModalVisible] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const fetchedCategories = await menuAPI.getCategories();
      setCategories(fetchedCategories);
    } catch (error: any) {
      message.error('Kategoriler yüklenirken hata oluştu');
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const items = await menuAPI.getMenuItems();
      setMenuItems(items);
      setFilteredMenuItems(items);
    } catch (error) {
      message.error('Menü öğeleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchComments = useCallback(async (menuItemId: number) => {
    try {
      const itemComments = await commentAPI.getMenuItemComments(menuItemId);
      setSelectedComments(itemComments);
      setIsCommentsModalVisible(true);
    } catch (error) {
      message.error('Yorumlar yüklenirken bir hata oluştu');
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, [fetchMenuItems, fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = menuItems.filter(item => item.category === selectedCategory);
      setFilteredMenuItems(filtered);
    } else {
      setFilteredMenuItems(menuItems);
    }
  }, [selectedCategory, menuItems]);

  const handleDelete = async (id: number) => {
    try {
      await menuAPI.deleteMenuItem(id);
      message.success('Menü öğesi başarıyla silindi');
      fetchMenuItems();
    } catch (error: any) {
      if (error.response?.status === 400) {
        message.error(error.response.data.error);
      } else {
        message.error('Menü öğesi silinirken bir hata oluştu');
      }
    }
  };

  const openUpdateModal = (id: number) => {
    setSelectedItemId(id);
    setIsUpdateModalVisible(true);
  };

  const renderOptions = (options: MenuOption[]) => {
    if (!options?.length) return '-';
    return options.map(opt => (
      `${opt.name} (₺${opt.price.toFixed(2)})`
    )).join(', ');
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'CLASSIC COFFEES': 'magenta',
      'ICED CLASSIC COFFEES': 'blue',
      'HOT AROME COFFESS': 'red',
      'ICED AROME COFFESS': 'cyan',
      'FRESH DRINKS': 'green',
      'KAHVE BAZLI FRAPPE': 'purple',
      'KREMA BAZLI FRAPPE': 'geekblue',
      'ŞİŞE İÇECEKLER': 'orange',
      'PASTALAR': 'pink',
      'WINTER DRINKS': 'volcano'
    };
    return colors[category] || 'default';
  };

  const columns = [
    {
      title: 'İsim',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `₺${price.toFixed(2)}`,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      ),
    },
    {
      title: 'Fi Puanı',
      dataIndex: 'points',
      key: 'points',
    },
    {
      title: 'Seçenekler',
      dataIndex: 'options',
      key: 'options',
      render: (options: MenuOption[]) => renderOptions(options),
    },

    {
      title: 'Yorumlar',
      dataIndex: 'id',
      key: 'comments',
      render: (id: number) => (
        <Button onClick={() => fetchComments(id)}>
          Yorumları Göster
        </Button>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: MenuItem) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openUpdateModal(record.id)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Bu öğeyi silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <Button
          type="primary"
          onClick={() => setIsCreateModalVisible(true)}
        >
          Yeni Menü Öğesi Ekle
        </Button>

        <Select
          style={{ width: 200 }}
          placeholder="Kategori Seçin"
          allowClear
          onChange={(value) => setSelectedCategory(value)}
          defaultValue=""
        >
          <Option value="">Hepsi</Option>
          {categories.map(category => (
            <Option key={category} value={category}>
              <Tag color={getCategoryColor(category)}>{category}</Tag>
            </Option>
          ))}
        </Select>

        <Button
          danger
          onClick={() => setIsDeleteCategoryModalVisible(true)}
          style={{ marginLeft: 8 }}
        >
          Kategori Sil
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredMenuItems}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Toplam ${total} öğe`,
        }}
      />

      <CreateMenuModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSuccess={fetchMenuItems}
      />

      {selectedItemId && (
        <UpdateMenuModal
          visible={isUpdateModalVisible}
          onCancel={() => {
            setIsUpdateModalVisible(false);
            setSelectedItemId(null);
          }}
          onSuccess={fetchMenuItems}
          menuItemId={selectedItemId}
        />
      )}

      <Modal
        title="Yorumlar"
        visible={isCommentsModalVisible}
        onCancel={() => setIsCommentsModalVisible(false)}
        footer={null}
      >
        <List
          dataSource={selectedComments}
          renderItem={comment => (
            <List.Item key={comment.id}>
              <List.Item.Meta
                title={`${comment.user.name} (${comment.user.email}) - ${comment.createdAt}`}
                description={comment.content || 'Yorum içeriği yok'}
              />
            </List.Item>
          )}
        />
      </Modal>

      <DeleteCategoryModal
        visible={isDeleteCategoryModalVisible}
        onCancel={() => setIsDeleteCategoryModalVisible(false)}
        onSuccess={() => {
          fetchCategories();
          setIsDeleteCategoryModalVisible(false);
        }}
      />
    </div>
  );
};

export default MenuItemPage;
