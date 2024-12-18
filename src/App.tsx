import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import OrdersPage from './pages/Orders/OrdersPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import UserPage from './pages/User/UserPage';
import trTR from 'antd/locale/tr_TR';
import PromotionPage from './pages/Promotion/PromotionPage';
import QrPage from './pages/QR/QrPage';
import MenuItemPage from './pages/Menu/MenuItemPage';
import AssignFreeProduct from './pages/Product';
import BlogPage from './pages/Blog/BlogPage';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={trTR}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute requireAdmin>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route path="orders" element={<OrdersPage />} />
            <Route path="users" element={<UserPage />} />
            <Route path="promotions" element={<PromotionPage />} />
            <Route path="qr" element={<QrPage />} />

            <Route path="menu" element={<MenuItemPage />} />

            <Route path="dashboard" element={<div>Dashboard Content</div>} />
            <Route path="qr-codes" element={<div>QR Codes Content</div>} />
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="free-product" element={<AssignFreeProduct />} />
            <Route path="blog" element={<BlogPage />} />

          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;