-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL,
    image TEXT NOT NULL,
    description TEXT,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    delivery_type VARCHAR(50) NOT NULL,
    delivery_date DATE NOT NULL,
    delivery_time VARCHAR(50) NOT NULL,
    delivery_address TEXT,
    payment_method VARCHAR(50) NOT NULL,
    card_comment TEXT,
    total_amount INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial products
INSERT INTO products (name, category, price, image, description, rating) VALUES
('Нежный рассвет', 'Романтика', 3500, 'https://cdn.poehali.dev/projects/dd4ef7dc-dc1d-4f12-a070-7b316a54f3af/files/efe4a806-c6e4-4995-b128-1e9895ed7e35.jpg', 'Букет из розовых пионов и белых роз', 5),
('Весенний сад', 'Весна', 2800, 'https://cdn.poehali.dev/projects/dd4ef7dc-dc1d-4f12-a070-7b316a54f3af/files/085f3e2f-8b4e-438d-8484-cee707115e02.jpg', 'Яркие тюльпаны и нарциссы', 5),
('Бархатная роскошь', 'Премиум', 5500, 'https://cdn.poehali.dev/projects/dd4ef7dc-dc1d-4f12-a070-7b316a54f3af/files/efe4a806-c6e4-4995-b128-1e9895ed7e35.jpg', 'Красные розы премиум класса', 5),
('Летняя мечта', 'Лето', 3200, 'https://cdn.poehali.dev/projects/dd4ef7dc-dc1d-4f12-a070-7b316a54f3af/files/085f3e2f-8b4e-438d-8484-cee707115e02.jpg', 'Полевые цветы в нежной гамме', 4),
('Королевский сад', 'Премиум', 6800, 'https://cdn.poehali.dev/projects/dd4ef7dc-dc1d-4f12-a070-7b316a54f3af/files/efe4a806-c6e4-4995-b128-1e9895ed7e35.jpg', 'Орхидеи и экзотические цветы', 5),
('Утренняя свежесть', 'Романтика', 2500, 'https://cdn.poehali.dev/projects/dd4ef7dc-dc1d-4f12-a070-7b316a54f3af/files/085f3e2f-8b4e-438d-8484-cee707115e02.jpg', 'Белые хризантемы и эвкалипт', 4);

-- Insert initial reviews
INSERT INTO reviews (author, rating, text, created_at) VALUES
('Мария К.', 5, 'Превосходное качество! Цветы свежие, доставка точно в срок. Букет "Нежный рассвет" произвёл фурор!', '2024-10-15 10:30:00'),
('Дмитрий П.', 5, 'Заказываю здесь уже второй раз. Всегда свежие цветы и красивая упаковка. Жена в восторге!', '2024-10-10 14:20:00'),
('Анна С.', 4, 'Очень красивый букет, единственное — хотелось бы больше вариантов упаковки. В целом рекомендую!', '2024-10-05 16:45:00');