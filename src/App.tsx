import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import trTR from 'antd/locale/tr_TR';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './components/Login';
import UnauthorizedPage from './pages/UnauthorizedPage';
import MainLayout from './components/MainLayout';

import HomePage from './pages/Home/HomePage';
import OrdersPage from './pages/Orders/OrdersPage';
import MenuItemPage from './pages/Menu/MenuItemPage';
import UserPage from './pages/User/UserPage';
import QrPage from './pages/QR/QrPage';
import PromotionPage from './pages/Promotion/PromotionPage';
import BlogPage from './pages/Blog/BlogPage';
import AssignFreeProduct from './pages/Product';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={trTR}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="menu" element={<MenuItemPage />} />
            <Route path="users" element={<UserPage />} />
            <Route path="qr" element={<QrPage />} />
            <Route path="promotion" element={<PromotionPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="free-product" element={<AssignFreeProduct />} />
          </Route>

          {/* Catch all undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;