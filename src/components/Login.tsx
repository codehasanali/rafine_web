import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminLogin } from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (token && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const response = await adminLogin(values.email, values.password);
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      message.error(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        style={{
          maxWidth: 300,
          padding: 24,
          borderRadius: 8,
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Admin Girişi</h2>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Lütfen email adresinizi girin!' },
            { type: 'email', message: 'Geçerli bir email adresi girin!' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Şifre"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Giriş Yap
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
