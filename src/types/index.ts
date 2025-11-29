export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'main' | 'drink' | 'side';
  image_url: string;
  is_available: boolean;
  spicy_level: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  order_type: 'online' | 'offline';
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  spicy_level: number;
  menu_item?: MenuItem;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  spicy_level: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager';
  created_at: string;
}
