import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Table, Tag, Space, Button, message, Typography, Grid } from 'antd';
import { formatDate } from '../../utils/dateFormatter';
import styled from 'styled-components';
import { orderAPI } from '../../services/api';
import { io } from 'socket.io-client';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Types
type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

interface OrderOption {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface MenuItem {
  name: string;
}

interface OrderItem {
  id: string;
  menuItemId: number;
  quantity: number;
  basePrice: number;
  finalPrice: number;
  notes?: string;
  menuItem: MenuItem;
  options: OrderOption[];
}

interface OrderUser {
  name: string;
  email: string;
}

interface OrderSocketData {
  id: string;
  type: OrderType;
  status: OrderStatus;
  totalAmount: number;
  finalAmount: number;
  notes?: string;
  earnedPoints: number;
  createdAt: string;
  items: OrderItem[];
  user: OrderUser;
}

interface Order extends OrderSocketData {
  userId: string;
  updatedAt: string;
}

interface OrderDetailModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

// Styled Components
const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .ant-modal-header {
    background-color: #f8f9fa;
    padding: 24px 28px;
    border-bottom: 1px solid #eee;
  }

  .ant-modal-body {
    padding: 28px;
  }

  .ant-descriptions {
    margin-bottom: 28px;
    
    .ant-descriptions-item-label {
      font-weight: 600;
      color: #4a5568;
    }

    .ant-descriptions-item-content {
      color: #2d3748;
    }
  }

  .ant-table {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .ant-table-thead > tr > th {
      background-color: #f8f9fa;
      font-weight: 600;
      padding: 16px;
    }

    .ant-table-tbody > tr > td {
      padding: 16px;
    }
  }

  @media (max-width: 1024px) {
    max-width: 90vw !important;
    margin: 16px;

    .ant-modal-body {
      padding: 20px;
    }

    .ant-descriptions-item {
      padding: 12px 16px;
    }

    .ant-table {
      font-size: 14px;
    }
  }

  @media (max-width: 768px) {
    max-width: 95vw !important;
    margin: 10px;

    .ant-modal-header {
      padding: 16px 20px;
    }

    .ant-modal-body {
      padding: 16px;
    }

    .ant-descriptions-item {
      padding: 8px 12px;
    }
  }
`;

const OrderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const StatusTag = styled(Tag)`
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 6px;
  font-weight: 500;
`;

const TotalSection = styled.div`
  margin-top: 28px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  
  .amount-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 4px 0;
    
    &:last-child {
      margin-bottom: 0;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }
  }

  @media (max-width: 576px) {
    padding: 16px;
    margin-top: 20px;
  }
`;

const ButtonGroup = styled(Space)`
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  @media (max-width: 576px) {
    flex-direction: column;
    width: 100%;

    .ant-btn {
      width: 100%;
    }
  }
`;

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  visible,
  order: initialOrder,
  onClose,
  onStatusChange,
}) => {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const screens = useBreakpoint();

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    if (!order) return;

    const socket = io('http://localhost:3000', {
      transports: ['websocket']
    });

    socket.on('orderUpdate', async (updatedOrder: OrderSocketData) => {
      if (updatedOrder.id === order.id) {
        try {
          const orderDetails = await orderAPI.getOrderById(updatedOrder.id);
          setOrder(orderDetails);
          onStatusChange(orderDetails.id, orderDetails.status);
        } catch (error) {
          console.error('Error fetching updated order details:', error);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [order?.id, onStatusChange]);

  if (!order) return null;

  const columns = [
    {
      title: 'Ürün',
      dataIndex: ['menuItem', 'name'],
      key: 'name',
      width: screens.md ? 200 : 150,
    },
    {
      title: 'Seçenekler',
      key: 'options',
      width: screens.md ? 250 : 200,
      render: (record: OrderItem) => (
        <Space direction="vertical" size={4}>
          {record.options.map((option, index) => (
            <Tag key={index} color="blue">
              {option.name} (+{option.price.toFixed(2)} TL)
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Not',
      key: 'notes',
      width: screens.md ? 200 : 150,
      render: (record: OrderItem) => record.notes || '-',
    },
    {
      title: 'Adet',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 120,
      render: (price: number) => `${price.toFixed(2)} TL`,
    },
    {
      title: 'Toplam',
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      width: 120,
      render: (price: number) => `${price.toFixed(2)} TL`,
    },
  ];

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus => {
    switch (currentStatus) {
      case 'PENDING': return 'PREPARING';
      case 'PREPARING': return 'READY';
      case 'READY': return 'COMPLETED';
      default: return currentStatus;
    }
  };

  const handleStatusChange = async () => {
    if (!order) return;

    const nextStatus = getNextStatus(order.status);
    try {
      await orderAPI.updateOrderStatus(order.id, nextStatus);
      onStatusChange(order.id, nextStatus);

      if (nextStatus === 'COMPLETED' && order.earnedPoints > 0) {
        message.success(`Sipariş tamamlandı! Müşteri ${order.earnedPoints} Fi Puanı kazandı.`);
      }
    } catch (error) {
      message.error('Sipariş durumu güncellenirken bir hata oluştu');
    }
  };

  const getActionButtonText = (status: OrderStatus): string => {
    switch (status) {
      case 'PENDING': return 'Hazırlanıyor';
      case 'PREPARING': return 'Hazır';
      case 'READY': return 'Tamamlandı';
      default: return '';
    }
  };

  return (
    <StyledModal
      title={
        <OrderHeader>
          <Title level={4} style={{ margin: 0 }}>Sipariş #{order.id.slice(-6)}</Title>
          <StatusTag color={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </StatusTag>
        </OrderHeader>
      }
      open={visible}
      onCancel={onClose}
      width={screens.lg ? 1200 : screens.md ? 900 : '95vw'}
      footer={
        <ButtonGroup>
          <Button key="close" onClick={onClose}>
            Kapat
          </Button>
          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <>
              <Button
                key="update"
                type="primary"
                onClick={handleStatusChange}
              >
                {getActionButtonText(order.status)}
              </Button>
              <Button
                key="cancel"
                type="primary"
                danger
                onClick={async () => {
                  try {
                    await orderAPI.updateOrderStatus(order.id, 'CANCELLED');
                    await onStatusChange(order.id, 'CANCELLED');
                  } catch (error) {
                    message.error('Sipariş iptal edilirken bir hata oluştu');
                  }
                }}
              >
                İptal Et
              </Button>
            </>
          )}
        </ButtonGroup>
      }
    >
      <Descriptions
        bordered
        column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
        size={screens.md ? 'default' : 'small'}
      >
        <Descriptions.Item label="Müşteri">{order.user.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{order.user.email}</Descriptions.Item>
        <Descriptions.Item label="Tarih">{formatDate(order.createdAt)}</Descriptions.Item>
        {order.notes && (
          <Descriptions.Item label="Notlar" span={2}>
            {order.notes}
          </Descriptions.Item>
        )}
      </Descriptions>

      <Table
        columns={columns}
        dataSource={order.items}
        pagination={false}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        size={screens.md ? 'middle' : 'small'}
      />

      <TotalSection>
        <div className="amount-row">
          <Text>Ara Toplam:</Text>
          <Text>{order.totalAmount.toFixed(2)} TL</Text>
        </div>
        {order.totalAmount !== order.finalAmount && (
          <div className="amount-row">
            <Text type="secondary">İndirim:</Text>
            <Text type="success">
              -{(order.totalAmount - order.finalAmount).toFixed(2)} TL
            </Text>
          </div>
        )}
        <div className="amount-row">
          <Text strong>Toplam:</Text>
          <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
            {order.finalAmount.toFixed(2)} TL
          </Text>
        </div>
        <div className="amount-row">
          <Text type="secondary">Kazanılan Fi Puanı:</Text>
          <Text type="secondary" style={{ fontWeight: 500 }}>
            {(order.finalAmount * 0.1).toFixed(0)}
          </Text>
        </div>
      </TotalSection>
    </StyledModal>
  );
};

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'PENDING': return 'gold';
    case 'PREPARING': return 'blue';
    case 'READY': return 'cyan';
    case 'COMPLETED': return 'green';
    case 'CANCELLED': return 'red';
    default: return 'default';
  }
};

const getStatusText = (status: OrderStatus): string => {
  switch (status) {
    case 'PENDING': return 'Beklemede';
    case 'PREPARING': return 'Hazırlanıyor';
    case 'READY': return 'Hazır';
    case 'COMPLETED': return 'Tamamlandı';
    case 'CANCELLED': return 'İptal Edildi';
    default: return status;
  }
};

export default OrderDetailModal;