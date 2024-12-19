import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, InputNumber, Checkbox, message, Select, Image, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { menuAPI } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

interface MenuOption {
  name: string;
  price: number;
  category: string;
  isDefault: boolean;
  isRequired: boolean;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  points: number;
  description: string;
  category: string;
  image: string;
  options: MenuOption[];
}

interface UpdateMenuModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  menuItemId: number;
}

const UpdateMenuModal: React.FC<UpdateMenuModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  menuItemId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [addOnOptions, setAddOnOptions] = useState<MenuOption[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await menuAPI.getCategories();
        if (Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('Kategoriler yüklenirken hata oluştu');
      }
    };
    fetchCategories();
  }, []);

  const formatImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/uploads/menu/')) {
      return `http://77.90.53.5:3000${imageUrl}`;
    }

    if (imageUrl.startsWith('/uploads/')) {
      return `http://77.90.53.5:3000/uploads/menu${imageUrl.substring(8)}`;
    }

    return `http://77.90.53.5:3000/uploads/menu/${imageUrl}`;
  };

  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        const menuItem = await menuAPI.getMenuItemById(menuItemId);

        const formattedImageUrl = formatImageUrl(menuItem.image);
        setImageUrl(formattedImageUrl);

        form.setFieldsValue({
          name: menuItem.name,
          price: menuItem.price,
          points: menuItem.points,
          category: menuItem.category,
          description: menuItem.description,
          image: menuItem.image
        });

        if (Array.isArray(menuItem.options)) {
          const options = menuItem.options.map(opt => ({
            name: opt.name,
            price: opt.price,
            category: opt.category || 'default',
            isDefault: opt.isDefault || false,
            isRequired: opt.isRequired || false
          }));
          setAddOnOptions(options);
          setSelectedAddOns(options.map(opt => opt.name));
        }

      } catch (error) {
        message.error('Menü öğesi yüklenirken hata oluştu');
      }
    };

    if (visible && menuItemId) {
      fetchMenuItem();
    }
  }, [visible, menuItemId, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append('name', values.name);
      formData.append('price', values.price.toString());
      formData.append('points', values.points.toString());
      formData.append('category', values.category);
      if (values.description) {
        formData.append('description', values.description);
      }

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      const options = selectedAddOns.map(name => {
        const option = addOnOptions.find(opt => opt.name === name);
        return {
          name,
          price: option?.price || 0,
          category: 'default',
          isDefault: false,
          isRequired: false
        };
      });

      formData.append('options', JSON.stringify(options));

      await menuAPI.updateMenuItem(menuItemId, formData);

      message.success('Menü öğesi başarıyla güncellendi');
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error: any) {
      console.error('Update error:', error);
      message.error('Menü öğesi güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (info: any) => {
    if (info.file) {
      setImageFile(info.file);
      setImageUrl(URL.createObjectURL(info.file));
    }
  };

  return (
    <Modal
      title="Menü Öğesini Güncelle"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
            dropdownRender={menu => (
              <>
                {menu}
                <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                  <Input
                    style={{ flex: 'auto' }}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button
                    type="link"
                    onClick={async () => {
                      if (newCategory && !categories.find(cat => cat.name === newCategory)) {
                        await menuAPI.createCategory(newCategory);
                        const newCat = { id: categories.length + 1, name: newCategory };
                        setCategories([...categories, newCat]);
                        form.setFieldsValue({ category: newCat.name });
                        setNewCategory('');
                      }
                    }}
                  >
                    Ekle
                  </Button>
                </div>
              </>
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

        <Form.Item label="Görsel">
          <Upload
            accept="image/*"
            beforeUpload={() => false}
            onChange={handleImageChange}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Görsel Seç</Button>
          </Upload>
        </Form.Item>

        {imageUrl && (
          <Form.Item label="Mevcut Görsel">
            <Image
              src={imageUrl}
              alt="Ürün görseli"
              style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
            />
          </Form.Item>
        )}

        <Form.Item label="Ekstralar">
          <Checkbox.Group
            options={addOnOptions.map(opt => ({
              label: `${opt.name} (+₺${opt.price.toFixed(2)})`,
              value: opt.name
            }))}
            value={selectedAddOns}
            onChange={(values) => setSelectedAddOns(values as string[])}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Güncelle
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateMenuModal;
