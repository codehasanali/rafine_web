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
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={trTR}>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={
              localStorage.getItem('token') ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout>
                  <HomePage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <MainLayout>
                  <OrdersPage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <PrivateRoute>
                <MainLayout>
                  <MenuItemPage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <MainLayout>
                  <UserPage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/qr"
            element={
              <PrivateRoute>
                <MainLayout>
                  <QrPage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/promotion"
            element={
              <PrivateRoute>
                <MainLayout>
                  <PromotionPage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/blog"
            element={
              <PrivateRoute>
                <MainLayout>
                  <BlogPage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/free-product"
            element={
              <PrivateRoute>
                <MainLayout>
                  <AssignFreeProduct />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/unauthorized"
            element={<UnauthorizedPage />}
          />

          {/* Catch all route */}
          <Route
            path="*"
            element={
              <Navigate to={localStorage.getItem('token') ? "/" : "/login"} replace />
            }
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;