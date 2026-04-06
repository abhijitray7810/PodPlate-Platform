export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface CartItem {
  id: string;
  type: 'product' | 'menu';
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: { name: string };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
