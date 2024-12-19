import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import trTR from 'antd/locale/tr_TR';


import HomePage from './pages/Home/HomePage';
import OrdersPage from './pages/Orders/OrdersPage';
import MenuItemPage from './pages/Menu/MenuItemPage';
import UserPage from './pages/User/UserPage';
import QrPage from './pages/QR/QrPage';
import PromotionPage from './pages/Promotion/PromotionPage';
import BlogPage from './pages/Blog/BlogPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import MainLayout from './components/MainLayout';
import LoginPage from './components/Login';
import AssignFreeProduct from './pages/Product';

const App: React.FC = () => {
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ConfigProvider locale={trTR}>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/menu" element={<MenuItemPage />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/qr" element={<QrPage />} />
            <Route path="/promotion" element={<PromotionPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/free-product" element={<AssignFreeProduct />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </Router>
    </ConfigProvider>
  );
};

export default App;