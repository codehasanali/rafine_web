import { useState, useEffect } from 'react';
import { freeProductAPI, userAPI, menuAPI, categoryAPI } from '../../services/api';
import { DatePicker, Select, Button, Form, message, Table, Popconfirm } from 'antd';
import dayjs from 'dayjs';

interface User {
  id: string;
  name: string;
  email: string;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  points: number;
  description: string;
  category: string;
}

interface FreeProduct {
  id: number;
  userId: string;
  menuItemId: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  menuItem: {
    name: string;
    price: number;
    category: string;
  };
  user: {
    name: string;
    email: string;
  };
}

interface Category {
  id: number;
  name: string;
}

const AssignFreeProduct = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [freeProducts, setFreeProducts] = useState<FreeProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, menuItemsData, freeProductsData, categoriesData] = await Promise.all([
          userAPI.getAllUsers(),
          menuAPI.getMenuItems(),
          freeProductAPI.getAllFreeProducts(),
          menuAPI.getCategories()
        ]);
        setUsers(usersData);
        setMenuItems(menuItemsData);
        setFreeProducts(freeProductsData);
        setCategories(categoriesData);
      } catch (error) {
        message.error('Veriler yüklenirken hata oluştu');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      const { userId, menuItemId, dateRange } = values;
      await freeProductAPI.assignFreeProduct({
        userId,
        menuItemId,
        startDate: dateRange[0].toDate(),
        endDate: dateRange[1].toDate()
      });
      message.success('Ücretsiz ürün başarıyla atandı');
      form.resetFields();

      // Refresh free products list
      const updatedFreeProducts = await freeProductAPI.getAllFreeProducts();
      setFreeProducts(updatedFreeProducts);
    } catch (error) {
      message.error('Ücretsiz ürün atanırken hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await freeProductAPI.deleteFreeProduct(id as never);
      message.success('Ücretsiz ürün başarıyla silindi');
      setFreeProducts(freeProducts.filter(product => product.id !== id));
    } catch (error) {
      message.error('Ücretsiz ürün silinirken hata oluştu');
    }
  };

  const columns = [
    {
      title: 'Kullanıcı',
      dataIndex: ['user', 'name'],
      key: 'userName',
      render: (_: string, record: FreeProduct) => (
        <span>{record.user.name} ({record.user.email})</span>
      )
    },
    {
      title: 'Ürün',
      dataIndex: ['menuItem', 'name'],
      key: 'menuItemName',
      render: (_: string, record: FreeProduct) => (
        <span>{record.menuItem.name} - {record.menuItem.category}</span>
      )
    },
    {
      title: 'Başlangıç Tarihi',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: Date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Bitiş Tarihi',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: Date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? 'green' : 'red' }}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      )
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_: any, record: FreeProduct) => (
        <Popconfirm
          title="Bu ücretsiz ürünü silmek istediğinizden emin misiniz?"
          onConfirm={() => handleDelete(record.id)}
          okText="Evet"
          cancelText="Hayır"
        >
          <Button danger>Sil</Button>
        </Popconfirm>
      )
    }
  ];

  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  return (
    <div>
      <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ maxWidth: 600, marginBottom: 24 }}>
        <Form.Item
          name="userId"
          label="Kullanıcı"
          rules={[{ required: true, message: 'Lütfen kullanıcı seçin' }]}
        >
          <Select
            showSearch
            placeholder="Kullanıcı seçin"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={users.map(user => ({
              value: user.id,
              label: `${user.name} (${user.email})`
            }))}
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Kategori"
        >
          <Select
            allowClear
            placeholder="Kategori seçin"
            onChange={setSelectedCategory}
            options={categories.map(category => ({
              value: category.name,
              label: category.name
            }))}
          />
        </Form.Item>

        <Form.Item
          name="menuItemId"
          label="Ürün"
          rules={[{ required: true, message: 'Lütfen ürün seçin' }]}
        >
          <Select
            showSearch
            placeholder="Ürün seçin"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={filteredMenuItems.map(item => ({
              value: item.id,
              label: `${item.name} (${item.price}₺) - ${item.category}`
            }))}
          />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Geçerlilik Tarihi"
          rules={[{ required: true, message: 'Lütfen geçerlilik tarihi seçin' }]}
        >
          <DatePicker.RangePicker
            showTime
            style={{ width: '100%' }}
            disabledDate={current => current && current < dayjs().startOf('day')}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Ücretsiz Ürün Ata
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={freeProducts}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Toplam ${total} ücretsiz ürün`
        }}
      />
    </div>
  );
};

export default AssignFreeProduct;
