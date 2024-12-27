import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.rafinecoffeeshop.com.tr',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Login function
export const adminLogin = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { user } = response.data.data;

    if (!user.isAdmin) {
      throw new Error('Yönetici yetkisine sahip değilsiniz');
    }

    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Email veya şifre hatalı');
    }
    throw new Error(error.response?.data?.message || 'Giriş başarısız');
  }
};
// QR Code generation
export const generateQRCode = async (points: number) => {
  const response = await api.post('/qr/generate', { points });
  return response.data;
};

interface MenuItem {
  id: number;
  name: string;
  price: number;
  points: number;
  description: string;
  image: string;
  category: string;
  options: MenuItemOption[];
}

interface MenuItemOption {
  id: number;
  name: string;
  price: number;
  category: string;
  isDefault: boolean;
  isRequired: boolean;
  menuItemId: number;
}

// Menu API functions
export const menuAPI = {
  createMenuItem: async (formData: FormData) => {
    try {
      const response = await api.post('/menu', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Create menu item error:', error);
      throw new Error(error.response?.data?.error || 'Menü öğesi oluşturulamadı');
    }
  },

  getMenuItems: async () => {
    try {
      const response = await api.get<MenuItem[]>('/menu');
      return response.data;
    } catch (error: any) {
      console.error('Get menu items error:', error);
      throw new Error(error.response?.data?.error || 'Menü öğeleri getirilemedi');
    }
  },

  getMenuItemById: async (id: number) => {
    try {
      const response = await api.get<MenuItem>(`/menu/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Get menu item error:', error);
      if (error.response?.status === 404) {
        throw new Error('Menü öğesi bulunamadı');
      }
      throw new Error(error.response?.data?.error || 'Menü öğesi getirilemedi');
    }
  },

  updateMenuItem: async (id: number, formData: FormData) => {
    try {
      const response = await api.put(`/menu/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
        transformRequest: (data) => data,
      });
      return response.data;
    } catch (error: any) {
      console.error('Update menu item error:', error);
      throw new Error(error.response?.data?.error || 'Menü öğesi güncellenemedi');
    }
  },

  deleteMenuItem: async (id: number) => {
    try {
      const response = await api.delete(`/menu/${id}`);
      if (response.status === 204) {
        return true;
      }
      return response.data;
    } catch (error: any) {
      console.error('Delete menu item error:', error);
      if (error.response?.status === 409) {
        throw new Error('Bu menü öğesi aktif siparişlerde kullanıldığı için silinemiyor');
      }
      if (error.response?.status === 404) {
        throw new Error('Menü öğesi bulunamadı');
      }
      throw new Error(error.response?.data?.error || 'Menü öğesi silinirken bir hata oluştu');
    }
  },

  createCategory: async (name: string) => {
    try {
      const response = await api.post('/category', { name });
      return response.data;
    } catch (error: any) {
      console.error('Create category error:', error);
      throw new Error(error.response?.data?.error || 'Kategori oluşturulamadı');
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/category');
      return response.data;
    } catch (error: any) {
      console.error('Get categories error:', error);
      throw new Error(error.response?.data?.error || 'Kategoriler getirilemedi');
    }
  },

  updateCategory: async (id: number, name: string) => {
    try {
      const response = await api.put(`/category/${id}`, { name });
      return response.data;
    } catch (error: any) {
      console.error('Update category error:', error);
      throw new Error(error.response?.data?.error || 'Kategori güncellenemedi');
    }
  },



};






// Promotion types
interface Promotion {
  id: string;
  code: string;
  type: 'DISCOUNT_PERCENTAGE' | 'DISCOUNT_AMOUNT' | 'BUY_X_GET_Y';
  value: number;
  minAmount?: number;
  maxAmount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  maxUses?: number;
  usedCount: number;
  isPersonal?: boolean;
  userId?: string;
}

// Promotion API functions
export const promotionAPI = {
  createPromotion: async (promotionData: Partial<Promotion> & {
    isPersonal?: boolean;
    userId?: string;
  }) => {
    try {
      const response = await api.post('/promotion', promotionData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Promosyon oluşturulamadı');
    }
  },

  validatePromotion: async (code: string, totalAmount: number) => {
    try {
      const response = await api.post('/promotion/validate', { code, totalAmount });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Promosyon doğrulanamadı');
    }
  },

  getActivePromotions: async () => {
    try {
      const response = await api.get('/promotion/active');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Aktif promosyonlar getirilemedi');
    }
  },

  checkPromotionUsage: async (code: string) => {
    try {
      const response = await api.post('/promotion/check-usage', { code });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Promosyon kullanımı kontrol edilemedi');
    }
  },

  applyPromotion: async (code: string, cartTotal: number) => {
    try {
      const response = await api.post('/promotion/apply', { code, cartTotal });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Promosyon uygulanamadı');
    }
  },

  getPromotionSummary: async () => {
    try {
      const response = await api.get('/promotion/summary');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Promosyon özeti alınamadı');
    }
  },

  deletePromotion: async (id: string) => {
    try {
      const response = await api.delete(`/promotion/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Promosyon silinemedi');
    }
  },

  getPersonalPromotions: async (userId: string) => {
    try {
      const response = await api.get(`/promotion/personal/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Kişisel promosyonlar getirilemedi');
    }
  },

};



// Get all users
export const getAllUsers = async () => {
  try {
    const response = await api.get('/user/all');
    return response.data.users;
  } catch (error: any) {
    console.error('Get all users error:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Kullanıcılar getirilemedi';
    throw new Error(errorMessage);
  }
};

// Comment API functions
export const commentAPI = {
  addComment: async (menuItemId: number, commentData: { text: string }) => {
    try {
      const response = await api.post(`/comment`, { menuItemId, ...commentData });
      return response.data;
    } catch (error: any) {
      console.error('Add comment error:', error);
      throw new Error(error.response?.data?.error || 'Yorum eklenemedi');
    }
  },

  getMenuItemComments: async (menuItemId: number) => {
    try {
      const response = await api.get(`/comment/menu-item/${menuItemId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get menu item comments error:', error);
      throw new Error(error.response?.data?.error || 'Yorumlar getirilemedi');
    }
  },

  deleteComment: async (commentId: number) => {
    try {
      await api.delete(`/comment/${commentId}`);
    } catch (error: any) {
      console.error('Delete comment error:', error);
      throw new Error(error.response?.data?.error || 'Yorum silinemedi');
    }
  }
};

// Free Product API functions
export const freeProductAPI = {
  assignFreeProduct: async (data: {
    userId: string;
    menuItemId: number;
    startDate: Date;
    endDate: Date;
  }) => {
    try {
      const response = await api.post('/free-products', data);
      return response.data;
    } catch (error: any) {
      console.error('Assign free product error:', error);
      throw new Error(error.response?.data?.error || 'Ücretsiz ürün tanımlanırken bir hata oluştu');
    }
  },

  getAllFreeProducts: async () => {
    try {
      const response = await api.get('/free-products');
      return response.data;
    } catch (error: any) {
      console.error('Get all free products error:', error);
      throw new Error(error.response?.data?.error || 'Ücretsiz ürünler getirilemedi');
    }
  },

  deleteFreeProduct: async (id: string) => {
    try {
      const response = await api.delete(`/free-products/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete free product error:', error);
      throw new Error(error.response?.data?.error || 'Ücretsiz ürün silinirken bir hata oluştu');
    }
  }
};

// User API functions
export const userAPI = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/user/all');
      return response.data.users;
    } catch (error: any) {
      console.error('Get all users error:', error);
      throw new Error(error.response?.data?.error || 'Kullanıcılar getirilemedi');
    }
  },

  getUser: async (id: string) => {
    try {
      const response = await api.get(`/user/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Get user error:', error);
      throw new Error(error.response?.data?.error || 'Kullanıcı getirilemedi');
    }
  },

  updateUser: async (id: string, data: any) => {
    try {
      const response = await api.put(`/user/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Update user error:', error);
      throw new Error(error.response?.data?.error || 'Kullanıcı güncellenemedi');
    }
  },

  deleteUser: async (id: string) => {
    try {
      const response = await api.delete(`/user/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete user error:', error);
      throw new Error(error.response?.data?.error || 'Kullanıcı silinemedi');
    }
  },

  getUserPoints: async (id: string) => {
    try {
      const response = await api.get(`/user/${id}/points`);
      return response.data;
    } catch (error: any) {
      console.error('Get user points error:', error);
      throw new Error(error.response?.data?.error || 'Kullanıcı puanları getirilemedi');
    }
  },

  getUsers: async (search?: string) => {
    try {
      const response = await api.get('/users', { params: { search } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Kullanıcılar yüklenemedi');
    }
  }
};

// Order API functions
export const orderAPI = {
  getOrders: async () => {
    try {
      const response = await api.get('/order/admin/all');
      return response.data.orders;
    } catch (error: any) {
      console.error('Get orders error:', error);
      throw new Error(error.response?.data?.error || 'Siparişler getirilemedi');
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const response = await api.patch(`/order/admin/update/${orderId}`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Update order status error:', error);
      throw new Error(error.response?.data?.error || 'Sipariş durumu güncellenemedi');
    }
  },

  getOrderById: async (orderId: string) => {
    try {
      const response = await api.get(`/order/admin/details/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get order by id error:', error);
      throw new Error(error.response?.data?.error || 'Sipariş detayları getirilemedi');
    }
  }
};

// Blog API functions
export const blogAPI = {
  // Categories
  createCategory: async (data: { name: string; description?: string }) => {
    try {
      const response = await api.post('/blog/categories', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Kategori oluşturulamadı');
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/blog/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Kategoriler alınamadı');
    }
  },

  // Posts
  createPost: async (formData: FormData) => {
    try {
      const response = await api.post('/blog/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Blog yazısı oluşturulamadı');
    }
  },

  getPosts: async () => {
    try {
      const response = await api.get('/blog/posts');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Blog yazıları alınamadı');
    }
  },

  // This endpoint doesn't exist in the backend yet - the route and controller need to be added
  deleteCategory: async (id: string) => {
    try {
      const response = await api.delete(`/blog/categories/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Kategori silinemedi');
    }
  },

  getPost: async (id: string) => {
    try {
      const response = await api.get(`/blog/posts/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Blog yazısı alınamadı');
    }
  },

  updatePost: async (id: string, formData: FormData) => {
    try {
      const response = await api.put(`/blog/posts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Blog yazısı güncellenemedi');
    }
  },

  deletePost: async (id: string) => {
    try {
      const response = await api.delete(`/blog/posts/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Blog yazısı silinemedi');
    }
  }
};

// Category API functions
export const categoryAPI = {





  deleteCategory: async (id: number) => {
    try {
      await api.delete(`/category/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Kategori silinemedi');
    }
  }
};


export default api;
