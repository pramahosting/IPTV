-- Sample SQL for a 'customers' table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY,
    age INTEGER,
    income INTEGER,
    balance INTEGER,
    region TEXT,
    is_active BOOLEAN
);

INSERT INTO customers (customer_id, age, income, balance, region, is_active) VALUES
(1,25,45000,1500,'North',1),
(2,33,62000,3000,'South',0),
(3,41,78000,5000,'East',1),
(4,29,56000,2000,'West',1),
(5,35,68000,3500,'North',0);