import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, message, Popconfirm, Tag } from 'antd';
import { promotionAPI } from '../../services/api';
import dayjs from 'dayjs';

interface PromotionModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId?: string;
  isPersonal?: boolean;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ 
  isVisible, 
  onClose, 
  userId,
  isPersonal = false 
}) => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      let response;
      if (isPersonal && userId) {
        response = await promotionAPI.getPersonalPromotions(userId);
      } else {
        response = await promotionAPI.getActivePromotions();
      }
      setPromotions(response);
    } catch (error: any) {
      message.error(error.message || 'Promosyonlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchPromotions();
    }
  }, [isVisible, userId, isPersonal]);

  const handleDelete = async (promotionId: string) => {
    try {
      await promotionAPI.deletePromotion(promotionId);
      message.success('Promosyon başarıyla silindi');
      fetchPromotions();
    } catch (error: any) {
      message.error(error.message || 'Promosyon silinirken hata oluştu');
    }
  };

  const columns = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const types = {
          DISCOUNT_PERCENTAGE: 'Yüzde İndirim',
          DISCOUNT_AMOUNT: 'Tutar İndirim',
          BUY_X_GET_Y: 'X Al Y Öde',
        };
        return types[type as keyof typeof types] || type;
      },
    },
    {
      title: 'Değer',
      dataIndex: 'value',
      key: 'value',
      render: (value: number, record: any) => {
        if (record.type === 'DISCOUNT_PERCENTAGE') {
          return `%${value}`;
        }
        if (record.type === 'BUY_X_GET_Y') {
          return `${record.buyQuantity} Al ${record.getQuantity} Öde`;
        }
        return `${value} TL`;
      },
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Kullanım',
      dataIndex: 'usedCount',
      key: 'usedCount',
      render: (usedCount: number, record: any) => 
        `${usedCount}${record.maxUses ? `/${record.maxUses}` : ''}`,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => 
        isActive ? 'Aktif' : 'Pasif',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: any) => (
        <Popconfirm
          title="Bu promosyonu silmek istediğinizden emin misiniz?"
          onConfirm={() => handleDelete(record.id)}
          okText="Evet"
          cancelText="Hayır"
        >
          <Button danger>Sil</Button>
        </Popconfirm>
      ),
    },
    {
      title: 'Tip',
      key: 'personalType',
      render: (record: any) => (
        record.isPersonal ? <Tag color="blue">Kişisel</Tag> : <Tag>Genel</Tag>
      ),
    },
  ];

  return (
    <Modal
      title={isPersonal ? "Kişisel Promosyonlar" : "Promosyon Kodları"}
      open={isVisible}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <Table
        dataSource={promotions}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

export default PromotionModal;
