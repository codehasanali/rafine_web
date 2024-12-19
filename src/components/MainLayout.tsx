import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    HomeOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    CoffeeOutlined,
    GiftOutlined,
    QrcodeOutlined,
    TagOutlined,
    FileTextOutlined,
    MenuOutlined,
    LogoutOutlined
} from '@ant-design/icons';

const { Content } = Layout;

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { key: '/', icon: <HomeOutlined />, label: 'Ana Sayfa' },
        { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Siparişler' },
        { key: '/menu', icon: <CoffeeOutlined />, label: 'Menü' },
        { key: '/users', icon: <UserOutlined />, label: 'Kullanıcılar' },
        { key: '/qr', icon: <QrcodeOutlined />, label: 'QR Kod' },
        { key: '/promotion', icon: <TagOutlined />, label: 'Promosyonlar' },
        { key: '/blog', icon: <FileTextOutlined />, label: 'Blog' },
        { key: '/free-product', icon: <GiftOutlined />, label: 'Hediye Ürün' },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Çıkış Yap',
            onClick: handleLogout,
            style: { marginTop: 'auto' }
        }
    ];

    const handleMenuClick = (path: string) => {
        navigate(path);
        if (isMobile) {
            setMobileDrawerVisible(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {isMobile && (
                <Button
                    type="primary"
                    icon={<MenuOutlined />}
                    onClick={() => setMobileDrawerVisible(true)}
                    style={{
                        position: 'fixed',
                        top: 16,
                        left: 16,
                        zIndex: 999
                    }}
                />
            )}

            {isMobile ? (
                <Drawer
                    placement="left"
                    onClose={() => setMobileDrawerVisible(false)}
                    open={mobileDrawerVisible}
                    width={250}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={({ key }) => handleMenuClick(key)}
                    />
                </Drawer>
            ) : (
                <Layout.Sider
                    width={250}
                    theme="light"
                    style={{
                        overflow: 'auto',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0
                    }}
                >
                    <div style={{ padding: '16px', textAlign: 'center' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: 40 }} />
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={({ key }) => handleMenuClick(key)}
                    />
                </Layout.Sider>
            )}

            <Layout style={{
                marginLeft: isMobile ? 0 : 250,
                transition: 'margin 0.2s'
            }}>
                <Content style={{ padding: '24px' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;