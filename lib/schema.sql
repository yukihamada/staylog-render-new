-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  billing_address JSONB,
  payment_method JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 施設テーブル
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  address TEXT,
  type TEXT,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 宿泊者テーブル
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  nationality TEXT,
  passport_number TEXT,
  date_of_birth DATE,
  id_photo_url TEXT,
  check_in_date DATE,
  check_out_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 製品テーブル
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  active BOOLEAN,
  name TEXT,
  description TEXT,
  image TEXT,
  metadata JSONB
);

-- 価格テーブル
CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');

CREATE TABLE IF NOT EXISTS prices (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products,
  active BOOLEAN,
  description TEXT,
  unit_amount BIGINT,
  currency TEXT CHECK (char_length(currency) = 3),
  type pricing_type,
  interval pricing_plan_interval,
  interval_count INTEGER,
  trial_period_days INTEGER,
  metadata JSONB
);

-- サブスクリプションテーブル
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  status subscription_status,
  metadata JSONB,
  price_id TEXT REFERENCES prices,
  quantity INTEGER,
  cancel_at_period_end BOOLEAN,
  created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cancel_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  canceled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  trial_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  trial_end TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- テストユーザーの作成
INSERT INTO users (id, email, password, full_name)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@staylog.jp',
  '$2a$10$GQf6REiTyX9nOi0JnQQ1i.Klut/hNR7ZYn6LQkjd.H2JKDIbQK1Wy', -- StayLog2025!
  'テストユーザー'
) ON CONFLICT (id) DO NOTHING;

-- 製品データの挿入
INSERT INTO products (id, active, name, description, image)
VALUES
  ('prod_basic', true, 'Basic', '小規模な宿泊施設向けの基本プラン', NULL),
  ('prod_standard', true, 'Standard', '中規模な宿泊施設向けの標準プラン', NULL),
  ('prod_professional', true, 'Professional', '大規模な宿泊施設向けのプロフェッショナルプラン', NULL)
ON CONFLICT (id) DO NOTHING;

-- 価格データの挿入
INSERT INTO prices (id, product_id, active, description, unit_amount, currency, type, interval, interval_count)
VALUES
  ('price_basic_monthly', 'prod_basic', true, '月額ベーシックプラン', 980, 'JPY', 'recurring', 'month', 1),
  ('price_basic_yearly', 'prod_basic', true, '年額ベーシックプラン', 9800, 'JPY', 'recurring', 'year', 1),
  ('price_standard_monthly', 'prod_standard', true, '月額スタンダードプラン', 2980, 'JPY', 'recurring', 'month', 1),
  ('price_standard_yearly', 'prod_standard', true, '年額スタンダードプラン', 29800, 'JPY', 'recurring', 'year', 1),
  ('price_professional_monthly', 'prod_professional', true, '月額プロフェッショナルプラン', 9800, 'JPY', 'recurring', 'month', 1),
  ('price_professional_yearly', 'prod_professional', true, '年額プロフェッショナルプラン', 98000, 'JPY', 'recurring', 'year', 1)
ON CONFLICT (id) DO NOTHING;