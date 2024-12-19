import React from 'react';
import { Layout, Space, Typography, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <AntHeader style={{ background: '#fff', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
        <div>
          <Text strong style={{ fontSize: '18px' }}>
            Admin Panel
          </Text>
        </div>
        <Space>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <Text>{user.name || 'Admin'}</Text>
          </Space>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;