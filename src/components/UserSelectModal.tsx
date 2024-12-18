import React, { useState, useEffect } from 'react';
import { Modal, Input, Table, message } from 'antd';
import { userAPI } from '../services/api';

interface UserSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (user: any) => void;
}

const UserSelectModal: React.FC<UserSelectModalProps> = ({ visible, onClose, onSelect }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response);
    } catch (error: any) {
      message.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchUsers();
    }
  }, [visible, search]);

  const columns = [
    {
      title: 'Ad Soyad',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'İşlem',
      key: 'action',
      render: (text: string, record: any) => (
        <a onClick={() => onSelect(record)}>Seç</a>
      ),
    },
  ];

  return (
    <Modal
      title="Kullanıcı Seç"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Input.Search
        placeholder="Kullanıcı ara..."
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Modal>
  );
};

export default UserSelectModal;