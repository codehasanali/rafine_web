import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Row, 
  Col,
  Tag,
  Space,
  message,
  Typography,
  Layout,
  Spin,
  Grid
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getAllUsers } from '../../services/api';

const { Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  points: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  scannedQRCodes: {
    id: string;
    points: number;
    createdAt: string;
  }[];
}

const UserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const screens = useBreakpoint();

  useEffect(() => {
    fetchUsers();

    const interval = setInterval(() => {
      fetchUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      message.error('Kullanıcılar yüklenirken bir hata oluştu');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'İsim',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
      fixed: screens.md ? undefined : 'left',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['lg'],
    },
    {
      title: 'Fi Puanlar',
      dataIndex: 'points',
      key: 'points',
      render: (points) => <Tag color="blue">{points} Puan</Tag>,
    },
    {
      title: 'Rol',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (isAdmin) => (
        <Tag color={isAdmin ? 'red' : 'green'}>
          {isAdmin ? 'Admin' : 'Kullanıcı'}
        </Tag>
      ),
      responsive: ['sm'],
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('tr-TR'),
      responsive: ['lg'],
    },
  
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Content style={{ padding: screens.md ? '24px' : '12px' }}>
      <Row justify="center">
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Card>
            <Title level={screens.md ? 2 : 3} style={{ marginBottom: screens.md ? '24px' : '16px' }}>
              Kullanıcılar
            </Title>
            
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              pagination={{
                pageSize: screens.md ? 10 : 5,
                showSizeChanger: screens.md,
                showTotal: (total) => `Toplam ${total} kullanıcı`,
                simple: !screens.md,
              }}
              scroll={{ x: 'max-content' }}
              size={screens.md ? 'middle' : 'small'}
            />
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default UserPage;
