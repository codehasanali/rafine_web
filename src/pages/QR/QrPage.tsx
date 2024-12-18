import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateQRCode } from '../../services/api';
import { Card, Button, Input, Modal, Row, Col, Typography, Space, Grid, message } from 'antd';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const QrPage: React.FC = () => {
  const [qrCode, setQrCode] = useState<{ qrId: string; points: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [customPoints, setCustomPoints] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [qrSize, setQrSize] = useState<number>(250);
  const screens = useBreakpoint();

  const updateQRSize = useCallback(() => {
    const size = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8, 1000);
    setQrSize(size);
  }, []);

  useEffect(() => {
    updateQRSize();
    window.addEventListener('resize', updateQRSize);
    return () => window.removeEventListener('resize', updateQRSize);
  }, [updateQRSize]);

  const handleGenerateQR = async (points: number) => {
    if (points <= 0) {
      message.error('Lütfen geçerli bir puan miktarı girin');
      return;
    }
    
    setLoading(true);
    try {
      const data = await generateQRCode(points);
      setQrCode(data);
      setShowQRModal(true);
      setCustomPoints('');
      setShowCustomInput(false);
    } catch (error) {
      message.error('QR kodu oluşturulurken bir hata oluştu');
      console.error('QR kodu oluşturulamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQR = () => {
    if (qrCode) {
      handleGenerateQR(qrCode.points);
    }
  };

  const predefinedPoints = [100, 200, 300, 500, 1000];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>QR Kod Yönetimi</Title>
        <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
          Müşteri ödül sistemi için QR kodları oluşturun ve yönetin
        </Text>

        <Row gutter={[16, 16]}>
          {predefinedPoints.map((points) => (
            <Col key={points} xs={12} sm={8} md={6}>
              <Button
                type="default"
                size="large"
                block
                onClick={() => handleGenerateQR(points)}
                loading={loading}
                style={{ 
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '12px',
                  transition: 'all 0.3s'
                }}
                className="hover-effect"
              >
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>{points}</div>
                <div style={{ fontSize: '16px', marginTop: '8px' }}>Puan</div>
              </Button>
            </Col>
          ))}
          <Col xs={12} sm={8} md={6}>
            <Button
              type={showCustomInput ? 'primary' : 'default'}
              size="large"
              block
              onClick={() => setShowCustomInput(!showCustomInput)}
              style={{ 
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '12px'
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>Özel</div>
              <div style={{ fontSize: '16px', marginTop: '8px' }}>Miktar</div>
            </Button>
          </Col>
        </Row>

        {showCustomInput && (
          <Row style={{ marginTop: '24px' }} gutter={16}>
            <Col flex="auto">
              <Input
                type="number"
                size="large"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                placeholder="Fi Puan miktarını girin"
                style={{ borderRadius: '8px' }}
              />
            </Col>
            <Col>
              <Button
                type="primary"
                size="large"
                onClick={() => handleGenerateQR(Number(customPoints))}
                disabled={!customPoints || loading}
                loading={loading}
                style={{ borderRadius: '8px' }}
              >
                Oluştur
              </Button>
            </Col>
          </Row>
        )}

        <Modal
          open={showQRModal}
          onCancel={() => setShowQRModal(false)}
          width={screens.md ? '90%' : '95%'}
          style={{ maxWidth: '1200px' }}
          footer={[
            <Button key="close" onClick={() => setShowQRModal(false)}>
              Kapat
            </Button>,
            <Button key="regenerate" type="primary" onClick={handleRegenerateQR}>
              Yenile
            </Button>,
            <Button
              key="new"
              type="primary"
              onClick={() => {
                setShowQRModal(false);
                setQrCode(null);
              }}
            >
              Yeni Kod
            </Button>,
          ]}
          centered
        >
          {qrCode && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                padding: '32px',
                background: 'white',
                borderRadius: '16px',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <QRCodeSVG
                  value={JSON.stringify({
                    qrId: qrCode.qrId,
                    type: 'points',
                    points: qrCode.points
                  })}
                  size={qrSize}
                  level="H"
                  includeMargin
                />
              </div>
              <Title level={2} style={{ color: '#1890ff', margin: '24px 0' }}>
                {qrCode.points} Fi Puanı
              </Title>
              <Space direction="vertical" size="large">
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  QR Kod ID: {qrCode.qrId}
                </Text>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Bu QR kodu müşterileriniz mobil uygulamadan tarayarak {qrCode.points} puan kazanabilir
                </Text>
              </Space>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default QrPage;
