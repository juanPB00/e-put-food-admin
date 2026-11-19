CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','resto','kurir','admin')),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','revision','rejected')),
  review_note TEXT,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  owner_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  category TEXT NOT NULL DEFAULT 'Masakan rumahan',
  emoji TEXT NOT NULL DEFAULT '🍽️',
  open_hours TEXT NOT NULL DEFAULT '09.00–21.00 WIB',
  promo TEXT
);
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  resto_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Makanan',
  price INT NOT NULL CHECK (price >= 0),
  description TEXT,
  emoji TEXT NOT NULL DEFAULT '🍛',
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  user_id INT NOT NULL REFERENCES users(id),
  resto_id INT NOT NULL REFERENCES restaurants(id),
  kurir_id INT REFERENCES users(id),
  -- pending -> preparing -> ready -> delivering -> arrived -> done | rejected
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  address TEXT NOT NULL,
  payment TEXT NOT NULL DEFAULT 'QRIS',
  subtotal INT NOT NULL,
  shipping INT NOT NULL,
  service_fee INT NOT NULL,
  discount INT NOT NULL DEFAULT 0,
  total INT NOT NULL,
  reject_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price INT NOT NULL,
  qty INT NOT NULL
);
CREATE TABLE IF NOT EXISTS order_events (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('user-kurir','user-resto','resto-kurir')),
  sender_id INT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ratings (
  order_id INT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  food INT NOT NULL CHECK (food BETWEEN 1 AND 5),
  courier INT NOT NULL CHECK (courier BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','refunded','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_resto ON orders(resto_id);
CREATE INDEX IF NOT EXISTS idx_orders_kurir ON orders(kurir_id);
CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(order_id, channel);
