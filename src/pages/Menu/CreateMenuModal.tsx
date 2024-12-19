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
      price: 20.00,
      category: "Add-ons",
      isDefault: false,
      isRequired: false
    },
    {
      name: "Extra Aroma",
      price: 15.00,
      category: "Add-ons",
      isDefault: false,
      isRequired: false
    },
    {
      name: "Krema",
      price: 10.00,
      category: "Add-ons",
      isDefault: false,
      isRequired: false
    }
  ];

  const packetOption = {
    name: "Paket",
    price: 15.00,
    category: "Packet",
    isDefault: false,
    isRequired: false
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;

    try {
      // Convert to uppercase before saving
      const uppercaseCategory = newCategory.toUpperCase();
      const createdCategory = await menuAPI.createCategory(uppercaseCategory);
      setCategories(prev => [...prev, createdCategory]);
      setNewCategory('');
      message.success('Kategori başarıyla eklendi');
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Ana menü öğesi bilgileri
      formData.append('name', values.name);
      formData.append('price', values.price.toString());
      formData.append('points', values.points.toString());
      formData.append('category', values.category.toUpperCase()); // Convert category to uppercase
      if (values.description) formData.append('description', values.description);

      // Seçilen ekstraları options dizisine dönüştür
      const options = selectedAddOns.map(addonName => {
        const addon = addOnOptions.find(opt => opt.name === addonName) || packetOption;
        return {
          name: addon.name,
          price: addon.price,
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
          <Checkbox.Group
            options={[
              ...addOnOptions.map(opt => ({
                label: `${opt.name} (+₺${opt.price.toFixed(2)})`,
                value: opt.name
              })),
              {
                label: `${packetOption.name} (+₺${packetOption.price.toFixed(2)})`,
                value: packetOption.name
              }
            ]}
            value={selectedAddOns}
            onChange={(values) => setSelectedAddOns(values as string[])}
          />
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
