import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, message } from 'antd';
import { Socket, io } from 'socket.io-client';
import { orderAPI } from '../../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import OrderDetailModal from './OrderDetailModal';
import type { ColumnType } from 'antd/es/table';

const SOCKET_URL = 'http://localhost:3000';
const NOTIFICATION_SOUND_URL = 'http://localhost:3000/correct3-95630.mp3 ';
dayjs.locale('tr');

type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

interface OrderItem {
  id: string;
  quantity: number;
  menuItemId: string;
  menuItem?: {
    name: string;
  };
  basePrice: number;
  finalPrice: number;
  notes?: string;
  options?: Array<{
    name: string;
    price: number;
    category: string;
  }>;
}

interface Order {
  id: string;
  orderNumber?: string;
  status: OrderStatus;
  type: OrderType;
  items: OrderItem[];
  user?: {
    name: string;
    email: string;
  };
  userId: string;
  totalAmount: number;
  finalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  earnedPoints: number;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchOrders();

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected in OrdersPage');
      newSocket.emit('joinOrderRoom', 'admin');
    });

    newSocket.on('newOrder', async (order: Order) => {
      console.log('New order received:', order);
      try {
        // Play notification sound
        playNotificationSound();
        
        // Fetch the complete order details when receiving a new order
        const orderDetails = await orderAPI.getOrderById(order.id);
        
        const formattedOrder: Order = {
          id: orderDetails.id,
          orderNumber: orderDetails.orderNumber || orderDetails.id.slice(-6),
          status: orderDetails.status,
          type: orderDetails.type,
          items: orderDetails.items.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            menuItemId: item.menuItemId,
            menuItem: {
              name: item.menuItem?.name || 'Ürün adı bulunamadı'
            },
            basePrice: item.basePrice,
            finalPrice: item.finalPrice,
            notes: item.notes || '',
            options: item.options || []
          })),
          user: orderDetails.user,
          totalAmount: orderDetails.totalAmount,
          finalAmount: orderDetails.finalAmount,
          notes: orderDetails.notes || '',
          createdAt: orderDetails.createdAt,
          earnedPoints: orderDetails.earnedPoints,
          userId: orderDetails.userId,
          updatedAt: orderDetails.updatedAt
        };
        
        setOrders(prevOrders => [formattedOrder, ...prevOrders]);
        message.success(`Yeni sipariş alındı: #${formattedOrder.orderNumber}`);
      } catch (error) {
        console.error('Error fetching order details:', error);
        message.error('Sipariş detayları alınamadı');
      }
    });

    newSocket.on('orderUpdate', async (updatedOrder: Order) => {
      console.log('Order update received:', updatedOrder);
      try {
        // Fetch the complete order details when receiving an update
        const orderDetails = await orderAPI.getOrderById(updatedOrder.id);
        
        const formattedOrder: Order = {
          id: orderDetails.id,
          orderNumber: orderDetails.orderNumber || orderDetails.id.slice(-6),
          status: orderDetails.status,
          type: orderDetails.type,
          items: orderDetails.items.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            menuItemId: item.menuItemId,
            menuItem: {
              name: item.menuItem?.name || 'Ürün adı bulunamadı'
            },
            basePrice: item.basePrice,
            finalPrice: item.finalPrice,
            notes: item.notes || '',
            options: item.options || []
          })),
          user: orderDetails.user,
          totalAmount: orderDetails.totalAmount,
          finalAmount: orderDetails.finalAmount,
          notes: orderDetails.notes || '',
          createdAt: orderDetails.createdAt,
          earnedPoints: orderDetails.earnedPoints,
          userId: orderDetails.userId,
          updatedAt: orderDetails.updatedAt
        };

        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === formattedOrder.id ? formattedOrder : order
          )
        );
        message.info(`Sipariş durumu güncellendi: #${formattedOrder.orderNumber}`);
      } catch (error) {
        console.error('Error fetching updated order details:', error);
        message.error('Sipariş detayları alınamadı');
      }
    });

    return () => {
      if (newSocket) {
        newSocket.off('newOrder');
        newSocket.off('orderUpdate');
        newSocket.disconnect();
      }
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrders();
      setOrders(response);
    } catch (error) {
      message.error('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      message.success('Sipariş durumu güncellendi');
    } catch (error) {
      message.error('Sipariş durumu güncellenirken bir hata oluştu');
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
      PENDING: 'gold',
      PREPARING: 'processing',
      READY: 'success',
      COMPLETED: '#87d068',
      CANCELLED: 'error'
    };
    return colors[status];
  };

  const getStatusText = (status: OrderStatus): string => {
    const texts: Record<OrderStatus, string> = {
      PENDING: 'Bekliyor',
      PREPARING: 'Hazırlanıyor',
      READY: 'Hazır',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal Edildi'
    };
    return texts[status];
  };

  const showOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const columns: ColumnType<Order>[] = [
    {
      title: 'Sipariş No',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (_: string, record: Order) => (
        <Button type="link" onClick={() => showOrderDetail(record)}>
          {record.orderNumber}
        </Button>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'user',
      key: 'user',
      render: (user: Order['user']) => user ? user.name : '-',
    },
    {
      title: 'Ürünler',
      dataIndex: 'items',
      key: 'items',
      render: (items: Order['items']) => (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {items.map((item, index) => (
            <li key={index}>
              {item.quantity}x {item.menuItem?.name || 'Ürün adı bulunamadı'}
              {item.notes && <small style={{ display: 'block', color: '#666' }}>Not: {item.notes}</small>}
              {item.options && item.options.length > 0 && (
                <small style={{ display: 'block', color: '#666' }}>
                  {item.options.map(opt => opt.name).join(', ')}
                </small>
              )}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Toplam',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount: number | undefined) => amount !== undefined ? `₺${amount.toFixed(2)}` : '-',
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD MMM YYYY HH:mm'),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: unknown, record: Order) => (
        <div>
          {record.status === 'PENDING' && (
            <Button 
              type="primary"
              onClick={() => handleStatusChange(record.id, 'PREPARING')}
            >
              Hazırlanmaya Başla
            </Button>
          )}
          {record.status === 'PREPARING' && (
            <Button 
              type="primary"
              onClick={() => handleStatusChange(record.id, 'READY')}
            >
              Hazır
            </Button>
          )}
          {record.status === 'READY' && (
            <Button 
              type="primary"
              onClick={() => handleStatusChange(record.id, 'COMPLETED')}
            >
              Tamamla
            </Button>
          )}
        </div>
      ),
    },
  ];

  const playNotificationSound = () => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.volume = 1.0;
      
      // Add event listeners to handle loading and errors
      audio.addEventListener('canplaythrough', () => {
        audio.play().catch(error => {
          console.error('Error playing notification sound:', error);
        });
      });

      audio.addEventListener('error', (e) => {
        console.error('Error loading notification sound:', e);
      });

      // Load the audio
      audio.load();
    } catch (error) {
      console.error('Error creating Audio object:', error);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Siparişler</h2>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <OrderDetailModal
        visible={modalVisible}
        order={selectedOrder  as never}
        onClose={() => setModalVisible(false)}
        onStatusChange={(orderId: string, newStatus: OrderStatus) => handleStatusChange(orderId, newStatus)}
      />
    </div>
  );
};

export default OrdersPage;
