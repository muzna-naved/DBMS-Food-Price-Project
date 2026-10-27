CREATE DATABASE food_price_db;
USE food_price_db;
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);
CREATE TABLE cities (
    city_id INT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    province VARCHAR(100)
);
CREATE TABLE price_records (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    city_id INT NOT NULL,
    record_date DATE NOT NULL,
    min_price DECIMAL(10,2),
    avg_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (city_id) REFERENCES cities(city_id),
    UNIQUE KEY unique_price (product_id, city_id, record_date),
    CHECK (min_price <= avg_price AND avg_price <= max_price)
);
USE food_price_db;
SELECT * FROM categories;
SELECT * FROM products;
SELECT * FROM cities;
SELECT * FROM price_records;
USE food_price_db;

SELECT
    p.product_name,
    p.unit,
    c.city_name,
    c.province,
    pr.min_price,
    pr.avg_price,
    pr.max_price
FROM price_records pr
JOIN products p
    ON pr.product_id = p.product_id
JOIN cities c
    ON pr.city_id = c.city_id
LIMIT 20;
CREATE INDEX idx_product_name ON products(product_name);
CREATE INDEX idx_city_name ON cities(city_name);
CREATE INDEX idx_price_lookup ON price_records(product_id, city_id);

USE food_price_db;
SELECT COUNT(*) FROM price_records;
SELECT * FROM price_records LIMIT 5;
SELECT COUNT(*) FROM price_records;

SELECT price_id, product_id, city_id, record_date, min_price, avg_price, max_price
FROM price_records
LIMIT 5;