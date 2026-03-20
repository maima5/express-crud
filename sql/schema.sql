--setup
CREATE DATABASE IF NOT EXISTS express_crud_db;
USE express_crud_db;

--table bos
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255)   NOT NULL,
    description TEXT,
    price       DECIMAL(12, 2) NOT NULL,
    stock       INT            NOT NULL DEFAULT 0,
    category    VARCHAR(100)   NOT NULL,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

--data dummy
INSERT INTO products (name, description, price, stock, category) VALUES
('Laptop Asus ROG',      'Gaming laptop high performance',         15000000, 10, 'Electronics'),
('Mouse Logitech MX',    'Wireless ergonomic mouse',               850000,   50, 'Accessories');