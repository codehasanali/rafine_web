import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Space, Avatar, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
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

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: 'Ana Sayfa',
        },
        {
            key: '/orders',
            icon: <ShoppingCartOutlined />,
            label: 'Siparişler',
        },
        {
            key: '/menu',
            icon: <CoffeeOutlined />,
            label: 'Menü',
        },
        {
            key: '/users',
            icon: <UserOutlined />,
            label: 'Kullanıcılar',
        },
        {
            key: '/qr',
            icon: <QrcodeOutlined />,
            label: 'QR Kod',
        },
        {
            key: '/promotion',
            icon: <TagOutlined />,
            label: 'Promosyonlar',
        },
        {
            key: '/free-product',
            icon: <GiftOutlined />,
            label: 'Hediye Ürünler',
        },
        {
            key: '/blog',
            icon: <FileTextOutlined />,
            label: 'Blog',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Çıkış Yap',
            onClick: handleLogout,
        },
    ];

    const handleMenuClick = (key: string) => {
        if (key === 'logout') {
            handleLogout();
        } else {
            navigate(key);
            setMobileDrawerVisible(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Mobile Header */}
            {isMobile && (
                <div
                    style={{
                        padding: '16px',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 999,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                >
                    <img src="/logo.png" alt="Logo" style={{ height: 32 }} />
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileDrawerVisible(true)}
                    />
                </div>
            )}

            {/* Mobile Drawer */}
            <Drawer
                title="Menü"
                placement="left"
                onClose={() => setMobileDrawerVisible(false)}
                open={mobileDrawerVisible}
                bodyStyle={{ padding: 0 }}
                width={250}
            >
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => handleMenuClick(key)}
                />
            </Drawer>

            {/* Desktop Sidebar */}
            {!isMobile && (
                <Layout.Sider
                    style={{
                        overflow: 'auto',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                    }}
                    theme="light"
                    width={250}
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
                marginTop: isMobile ? 64 : 0,
                transition: 'margin 0.2s'
            }}>
                <Content style={{
                    padding: isMobile ? '16px' : '24px',
                    minHeight: 280
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;