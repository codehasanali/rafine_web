import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, message, Switch } from 'antd';
import { promotionAPI } from '../../services/api';
import dayjs from 'dayjs';
import PromotionModal from './PromationModal';
import UserSelectModal from '../../components/UserSelectModal';

const { Option } = Select;

const PromotionPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [promotionType, setPromotionType] = useState('DISCOUNT_PERCENTAGE');
  const [isPersonal, setIsPersonal] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    form.resetFields(['value', 'maxAmount', 'buyQuantity', 'getQuantity']);
  }, [promotionType, form]);

  const onFinish = async (values: any) => {
    try {
      if (isPersonal && !selectedUser) {
        message.error('Kişiye özel promosyon için kullanıcı seçmelisiniz');
        return;
      }

      setLoading(true);
      
      const promotionData = {
        code: values.code.toUpperCase(),
        type: values.type,
        value: values.type === 'BUY_X_GET_Y' ? 0 : values.value,
        minAmount: values.minAmount,
        maxAmount: values.type === 'DISCOUNT_PERCENTAGE' ? values.maxAmount : undefined,
        buyQuantity: values.type === 'BUY_X_GET_Y' ? values.buyQuantity : undefined,
        getQuantity: values.type === 'BUY_X_GET_Y' ? values.getQuantity : undefined,
        startDate: values.dateRange[0].toDate(),
        endDate: values.dateRange[1].toDate(),
        maxUses: values.maxUses,
        isActive: true,
        isPersonal: isPersonal,
        userId: isPersonal ? selectedUser.id : undefined
      };

      await promotionAPI.createPromotion(promotionData);
      message.success('Promosyon başarıyla oluşturuldu');
      form.resetFields();
      setSelectedUser(null);
      setIsPersonal(false);
      
    } catch (error: any) {
      if (error.response?.data?.error === 'Bu promosyon kodu zaten kullanımda') {
        message.error('Bu promosyon kodu zaten kullanımda. Lütfen farklı bir kod deneyin.');
      } else {
        message.error(error.message || 'Promosyon oluşturulurken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setIsUserModalVisible(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Yeni Promosyon Oluştur</h2>
        <Button onClick={() => setIsModalVisible(true)}>Eski Promosyonlar</Button>
      </div>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          type: 'DISCOUNT_PERCENTAGE'
        }}
      >
        <Form.Item
          name="code"
          label="Promosyon Kodu"
          rules={[
            { required: true, message: 'Lütfen promosyon kodu girin' },
            { pattern: /^[A-Za-z0-9]+$/, message: 'Promosyon kodu sadece harf ve rakam içerebilir' },
            { min: 3, message: 'Promosyon kodu en az 3 karakter olmalıdır' },
            { max: 20, message: 'Promosyon kodu en fazla 20 karakter olabilir' }
          ]}
          normalize={(value) => value?.toUpperCase()}
        >
          <Input placeholder="Örn: YILBASI2024" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Promosyon Tipi"
          rules={[{ required: true }]}
        >
          <Select onChange={(value) => setPromotionType(value)}>
            <Option value="DISCOUNT_PERCENTAGE">Yüzde İndirim</Option>
            <Option value="DISCOUNT_AMOUNT">Tutar İndirim</Option>
            <Option value="BUY_X_GET_Y">Al-Kazan</Option>
          </Select>
        </Form.Item>

        {promotionType !== 'BUY_X_GET_Y' && (
          <Form.Item
            name="value"
            label="İndirim Değeri"
            rules={[{ required: true, message: 'Lütfen indirim değeri girin' }]}
          >
            <InputNumber
              min={0}
              max={promotionType === 'DISCOUNT_PERCENTAGE' ? 100 : undefined}
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}

        <Form.Item
          name="minAmount"
          label="Minimum Sepet Tutarı"
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        {promotionType === 'DISCOUNT_PERCENTAGE' && (
          <Form.Item
            name="maxAmount"
            label="Maksimum İndirim Tutarı"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        )}

        {promotionType === 'BUY_X_GET_Y' && (
          <>
            <Form.Item
              name="buyQuantity"
              label="Kaç Adet Alınacak?"
              rules={[{ required: true, message: 'Lütfen alınacak ürün adedini girin' }]}
              tooltip="Müşterinin kaç adet ürün alması gerektiğini belirtin"
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Örn: 2" />
            </Form.Item>
            
            <Form.Item
              name="getQuantity" 
              label="Kaç Adet Ödenecek?"
              rules={[
                { required: true, message: 'Lütfen ödenecek ürün adedini girin' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const buyQuantity = getFieldValue('buyQuantity');
                    if (value && buyQuantity && value <= buyQuantity) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Ödenecek miktar, alınan miktardan fazla olamaz!'));
                  },
                }),
              ]}
              tooltip="Müşterinin kaç adet için ödeme yapacağını belirtin. Örnek: 2 Al 1 Öde için, 2 alınacak 1 ödenecek şeklinde ayarlayın"
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Örn: 1" />
            </Form.Item>

            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                Promosyon Örneği:
              </div>
              <div>
                {form.getFieldValue('buyQuantity') && form.getFieldValue('getQuantity') ? (
                  `Müşteri ${form.getFieldValue('buyQuantity')} adet ürün alacak, 
                   ${form.getFieldValue('getQuantity')} adet için ödeme yapacak. 
                   (${form.getFieldValue('buyQuantity') - form.getFieldValue('getQuantity')} adet bedava)`
                ) : 'Lütfen adet bilgilerini girin'}
              </div>
            </div>
          </>
        )}

        <Form.Item
          name="dateRange"
          label="Geçerlilik Tarihi"
          rules={[{ required: true, message: 'Lütfen geçerlilik tarihi seçin' }]}
        >
          <DatePicker.RangePicker
            showTime
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>

        <Form.Item
          name="maxUses"
          label="Maksimum Kullanım Sayısı"
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Kişiye Özel Promosyon">
          <Switch
            checked={isPersonal}
            onChange={(checked) => {
              setIsPersonal(checked);
              if (!checked) {
                setSelectedUser(null);
              }
            }}
          />
        </Form.Item>

        {isPersonal && (
          <Form.Item
            label="Kullanıcı Seç"
            required
            help={selectedUser ? `Seçili Kullanıcı: ${selectedUser.name} (${selectedUser.email})` : 'Lütfen bir kullanıcı seçin'}
          >
            <Button onClick={() => setIsUserModalVisible(true)}>
              {selectedUser ? 'Kullanıcıyı Değiştir' : 'Kullanıcı Seç'}
            </Button>
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Promosyon Oluştur
          </Button>
        </Form.Item>
      </Form>

      <PromotionModal 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

      <UserSelectModal
        visible={isUserModalVisible}
        onClose={() => setIsUserModalVisible(false)}
        onSelect={handleUserSelect}
      />
    </div>
  );
};

export default PromotionPage;
