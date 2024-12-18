import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="403"
      subTitle="Üzgünüz, bu sayfaya erişim yetkiniz yok."
      extra={
        <Button type="primary" onClick={() => navigate('/login')}>
          Giriş Sayfasına Dön
        </Button>
      }
    />
  );
};

export default UnauthorizedPage; 