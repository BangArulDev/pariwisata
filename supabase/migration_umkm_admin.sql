-- Migration for UMKM Admin Panel Features
-- Includes: Product Ownership, Orders, and Order Items

-- 1. Update 'products' table to support UMKM ownership
-- We assume 'products' table already exists. If not, we create a basic one.
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  stock integer DEFAULT 0,
  image_url text,
  category_id bigint REFERENCES public.categories(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add owner_id to products if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'owner_id') THEN
        ALTER TABLE public.products ADD COLUMN owner_id uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view products
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

-- Policy: Owners can insert/update/delete their own products
DROP POLICY IF EXISTS "Owners can manage their products" ON public.products;
CREATE POLICY "Owners can manage their products" 
ON public.products 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);


-- 2. Create 'orders' table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL, -- The buyer
  status text DEFAULT 'pending', -- pending, paid, shipped, completed, cancelled
  total_amount numeric DEFAULT 0,
  shipping_address jsonb, -- Flexible address format
  payment_proof text, -- URL to payment proof image
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can create orders
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- (Note: UMKMs need to see orders via order_items, typically we don't give them direct access to the whole order 
-- unless we want them to see other people's products in the same cart. 
-- For simplicity, we can allow UMKMs to view orders where they have items, but that requires a complex policy or a joined view. 
-- Often it's easier to query 'order_items' and join 'orders'.)


-- 3. Create 'order_items' table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  umkm_id uuid REFERENCES auth.users(id), -- Denormalized for easy security checks
  quantity integer DEFAULT 1,
  price numeric DEFAULT 0, -- Price at the time of purchase
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users (Buyers) can view their own order items
DROP POLICY IF EXISTS "Buyers can view their order items" ON public.order_items;
CREATE POLICY "Buyers can view their order items" 
ON public.order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Policy: UMKMs (Sellers) can view items for their products
DROP POLICY IF EXISTS "Sellers can view their order items" ON public.order_items;
CREATE POLICY "Sellers can view their order items" 
ON public.order_items FOR SELECT 
USING (auth.uid() = umkm_id);

-- Policy: Users can insert order items (usually done via backend or RPC, but for direct inserts:)
DROP POLICY IF EXISTS "Buyers can create order items" ON public.order_items;
CREATE POLICY "Buyers can create order items" 
ON public.order_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);
