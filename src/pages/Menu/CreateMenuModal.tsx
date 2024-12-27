import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, message, Modal, Checkbox, Select, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { menuAPI } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

interface CreateMenuModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const CreateMenuModal: React.FC<CreateMenuModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [addonPrices, setAddonPrices] = useState<{ [key: string]: number }>({});
  const [defaultPrices, setDefaultPrices] = useState<{ [key: string]: number }>({
    "Extra Shot": 20.00,
    "Extra Aroma": 15.00,
    "Krema": 10.00,
    "Paket": 15.00
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await menuAPI.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        message.error('Kategoriler yüklenirken hata oluştu');
      }
    };

    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  const addOnOptions = [
    {
      name: "Extra Shot",
      defaultPrice: 20.00,
      category: "Add-ons",
      isDefault: false,
      isRequired: false
    },
    {
      name: "Extra Aroma",
      defaultPrice: 15.00,
      category: "Add-ons",
      isDefault: false,
      isRequired: false
    },
    {
      name: "Krema",
      defaultPrice: 10.00,
      category: "Add-ons",
      isDefault: false,
      isRequired: false
    }
  ];

  const packetOption = {
    name: "Paket",
    defaultPrice: 15.00,
    category: "Packet",
    isDefault: false,
    isRequired: false
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;

    try {
      const uppercaseCategory = newCategory.toUpperCase();
      const createdCategory = await menuAPI.createCategory(uppercaseCategory);
      setCategories(prev => [...prev, createdCategory]);
      setNewCategory('');
      message.success('Kategori başarıyla eklendi');
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleUpdateDefaultPrice = (addonName: string) => {
    const currentPrice = addonPrices[addonName];
    setDefaultPrices(prev => ({
      ...prev,
      [addonName]: currentPrice
    }));
    message.success(`${addonName} için varsayılan fiyat güncellendi`);
  };

  const handleAddonPriceChange = (addonName: string, newPrice: number) => {
    setAddonPrices(prev => ({
      ...prev,
      [addonName]: newPrice
    }));
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append('name', values.name);
      formData.append('price', values.price.toString());
      formData.append('points', values.points.toString());
      formData.append('category', values.category.toUpperCase());
      if (values.description) formData.append('description', values.description);

      const options = selectedAddOns.map(addonName => {
        const addon = addOnOptions.find(opt => opt.name === addonName) || packetOption;
        return {
          name: addon.name,
          price: addonPrices[addon.name] || defaultPrices[addon.name],
          category: 'ADDON',
          isDefault: false,
          isRequired: false
        };
      });

      formData.append('options', JSON.stringify(options));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await menuAPI.createMenuItem(formData);
      message.success('Menü öğesi başarıyla oluşturuldu');
      form.resetFields();
      setSelectedAddOns([]);
      setImageFile(null);
      onSuccess?.();
      onCancel();
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      message.error(error.message || 'Menü öğesi oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Yeni Menü Öğesi Ekle"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          label="İsim"
          rules={[{ required: true, message: 'Lütfen ürün adını giriniz' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="price"
          label="Fiyat"
          rules={[{ required: true, message: 'Lütfen fiyat giriniz' }]}
        >
          <InputNumber
            min={0}
            precision={2}
            style={{ width: '100%' }}
            formatter={value => `₺ ${value}`}
          />
        </Form.Item>

        <Form.Item
          name="points"
          label="Fi Puanı"
          rules={[{ required: true, message: 'Lütfen fi puanı değeri giriniz' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="category"
          label="Kategori"
          rules={[{ required: true, message: 'Lütfen kategori seçiniz' }]}
        >
          <Select
            placeholder="Kategori seçiniz"
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            dropdownRender={menu => (
              <div>
                {menu}
                <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                  <Input
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="Yeni kategori"
                    style={{ flex: 'auto' }}
                  />
                  <Button type="primary" onClick={handleAddCategory} style={{ marginLeft: 8 }}>
                    Ekle
                  </Button>
                </div>
              </div>
            )}
          >
            {categories.map(category => (
              <Option key={category.id} value={category.name}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Açıklama"
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="image"
          label="Görsel"
        >
          <Upload
            beforeUpload={(file) => {
              setImageFile(file);
              return false;
            }}
            maxCount={1}
            listType="picture-card"
            accept="image/*"
            onRemove={() => setImageFile(null)}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Görsel Yükle</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item label="Ekstralar">
          <div style={{ marginBottom: 16 }}>
            <Checkbox.Group
              options={[
                ...addOnOptions.map(opt => ({
                  label: `${opt.name} (Varsayılan: ₺${defaultPrices[opt.name].toFixed(2)})`,
                  value: opt.name
                })),
                {
                  label: `${packetOption.name} (Varsayılan: ₺${defaultPrices[packetOption.name].toFixed(2)})`,
                  value: packetOption.name
                }
              ]}
              value={selectedAddOns}
              onChange={(values) => setSelectedAddOns(values as string[])}
            />
          </div>

          {selectedAddOns.map(addon => (
            <div key={addon} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{addon} Güncel Fiyat:</span>
              <InputNumber
                min={0}
                precision={2}
                value={addonPrices[addon] || defaultPrices[addon]}
                onChange={(value) => handleAddonPriceChange(addon, value || 0)}
                formatter={value => `₺ ${value}`}
                style={{ width: '150px' }}
              />
              <Button
                type="primary"
                onClick={() => handleUpdateDefaultPrice(addon)}
                size="small"
              >
                Varsayılan Olarak Ayarla
              </Button>
            </div>
          ))}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Oluştur
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateMenuModal;
