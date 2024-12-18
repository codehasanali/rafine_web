import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  QrcodeOutlined,
  GiftOutlined,
  MenuOutlined,
  TagOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import Header from './Header';

const { Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [siderWidth, setSiderWidth] = useState(200);
  const [contentMargin, setContentMargin] = useState('24px');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width >= 1366) {
        setSiderWidth(250);
        setContentMargin('32px');
      } else if (width >= 1194) {
        setSiderWidth(220);
        setContentMargin('24px');
      } else if (width >= 1080) {
        setSiderWidth(200);
        setContentMargin('20px');
      } else if (width >= 1024) {
        setSiderWidth(180);
        setContentMargin('16px');
      } else {
        setSiderWidth(160);
        setContentMargin('12px');
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'orders':
        navigate('/orders');
        break;
      case 'users':
        navigate('/users');
        break;
      case 'qr':
        navigate('/qr');
        break;
      case "promotions":
        navigate('/promotions');
        break;
      case "menu":
        navigate('/menu');
        break;
      case "free-product":
        navigate('/free-product');
        break;
      case "blog":
        navigate('/blog');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'orders', icon: <ShoppingCartOutlined />, label: 'Siparişler' },
    { key: 'users', icon: <UserOutlined />, label: 'Kullanıcılar' },
    { key: 'qr', icon: <QrcodeOutlined />, label: 'QR Kodlar' },
    { key: 'promotions', icon: <GiftOutlined />, label: 'Promosyonlar' },
    { key: 'menu', icon: <MenuOutlined />, label: 'Menü' },
    { key: 'free-product', icon: <TagOutlined />, label: 'Ücretsiz Ürün' },
    { key: 'blog', icon: <TagOutlined />, label: 'Blog' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={siderWidth}
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100
        }}
      >
        <div className="logo-container" style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              height: '32px',
              width: collapsed ? '32px' : 'auto',
              transition: 'width 0.2s'
            }}
          />
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          style={{
            height: 'calc(100% - 64px)',
            borderRight: 0,
            fontSize: window.innerWidth >= 1366 ? '15px' : '14px',
            padding: '16px 0'
          }}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>

      <Layout style={{
        marginLeft: collapsed ? '80px' : siderWidth,
        transition: 'margin-left 0.2s',
        background: '#f5f5f5'
      }}>
        <Header />
        <Content style={{
          margin: contentMargin,
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          minHeight: 'calc(100vh - 64px - 48px)',
          overflow: 'auto'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;