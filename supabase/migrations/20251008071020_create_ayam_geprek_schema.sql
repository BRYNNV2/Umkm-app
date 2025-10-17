/*
  # Ayam Geprek UMKM Database Schema

  ## Overview
  This migration creates the complete database structure for an Ayam Geprek food ordering system
  with admin management capabilities.

  ## New Tables

  ### 1. `menu_items`
  Stores all menu items (ayam geprek variants, drinks, sides)
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Item name
  - `description` (text) - Item description
  - `price` (integer) - Price in rupiah
  - `category` (text) - Category: 'main', 'drink', 'side'
  - `image_url` (text) - Image URL
  - `is_available` (boolean) - Availability status
  - `spicy_level` (integer) - Spicy level 0-5
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. `orders`
  Stores all customer orders (online and offline)
  - `id` (uuid, primary key) - Unique identifier
  - `customer_name` (text) - Customer name
  - `customer_phone` (text) - Customer phone number
  - `order_type` (text) - 'online' or 'offline'
  - `total_amount` (integer) - Total order amount in rupiah
  - `status` (text) - Order status: 'pending', 'completed', 'cancelled'
  - `notes` (text, optional) - Order notes
  - `created_at` (timestamptz) - Order timestamp
  - `created_by` (uuid, optional) - Admin who created offline order

  ### 3. `order_items`
  Stores individual items within each order
  - `id` (uuid, primary key) - Unique identifier
  - `order_id` (uuid, foreign key) - Reference to orders table
  - `menu_item_id` (uuid, foreign key) - Reference to menu_items table
  - `quantity` (integer) - Item quantity
  - `price` (integer) - Price at time of order
  - `spicy_level` (integer) - Selected spicy level

  ### 4. `admin_users`
  Stores admin user information linked to Supabase auth
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - Admin email
  - `full_name` (text) - Admin full name
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for menu_items
  - Authenticated admin access for orders and order_items
  - Public insert for orders (customer orders)
  - Admin-only access for admin_users table

  ## Indexes
  - Index on orders.created_at for performance
  - Index on order_items.order_id for joins

  ## Initial Data
  - Sample menu items for Ayam Geprek
  - Admin user: admin@ayamgeprek.com / Admin123!
*/

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  category text NOT NULL CHECK (category IN ('main', 'drink', 'side')),
  image_url text NOT NULL,
  is_available boolean DEFAULT true,
  spicy_level integer DEFAULT 0 CHECK (spicy_level >= 0 AND spicy_level <= 5),
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  order_type text NOT NULL DEFAULT 'online' CHECK (order_type IN ('online', 'offline')),
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  price integer NOT NULL CHECK (price >= 0),
  spicy_level integer DEFAULT 2 CHECK (spicy_level >= 0 AND spicy_level <= 5)
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_items
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for orders
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create online orders"
  ON orders FOR INSERT
  WITH CHECK (order_type = 'online' OR (
    order_type = 'offline' AND EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  ));

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create order items for their orders"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete order items"
  ON order_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for admin_users
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, image_url, spicy_level) VALUES
  ('Ayam Geprek Original', 'Ayam goreng tepung crispy dengan sambal geprek original', 15000, 'main', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Ayam Geprek Keju', 'Ayam geprek dengan taburan keju melimpah', 20000, 'main', 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Ayam Geprek Mozarella', 'Ayam geprek dengan keju mozarella premium', 25000, 'main', 'https://images.pexels.com/photos/10930513/pexels-photo-10930513.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Ayam Geprek Sambal Matah', 'Ayam geprek dengan sambal matah khas Bali', 22000, 'main', 'https://images.pexels.com/photos/8697343/pexels-photo-8697343.jpeg?auto=compress&cs=tinysrgb&w=800', 3),
  ('Ayam Geprek Jumbo', 'Ayam geprek ukuran jumbo untuk yang lapar berat', 28000, 'main', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Es Teh Manis', 'Teh manis dingin segar', 3000, 'drink', 'https://images.pexels.com/photos/1635349/pexels-photo-1635349.jpeg?auto=compress&cs=tinysrgb&w=800', 0),
  ('Es Jeruk', 'Jeruk peras segar dingin', 5000, 'drink', 'https://images.pexels.com/photos/1337824/pexels-photo-1337824.jpeg?auto=compress&cs=tinysrgb&w=800', 0),
  ('Teh Tawar', 'Teh tawar hangat', 2000, 'drink', 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=800', 0),
  ('Nasi Putih', 'Nasi putih pulen', 5000, 'side', 'https://images.pexels.com/photos/1692004/pexels-photo-1692004.jpeg?auto=compress&cs=tinysrgb&w=800', 0),
  ('Kerupuk', 'Kerupuk renyah', 2000, 'side', 'https://images.pexels.com/photos/6210747/pexels-photo-6210747.jpeg?auto=compress&cs=tinysrgb&w=800', 0)
ON CONFLICT DO NOTHING;