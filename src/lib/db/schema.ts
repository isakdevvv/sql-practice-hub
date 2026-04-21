export const SCHEMA_SQL = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  created_at DATE
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  category TEXT,
  price NUMERIC,
  stock INTEGER
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  created_at DATE,
  status TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  price NUMERIC,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  order_id INTEGER,
  amount NUMERIC,
  method TEXT,
  status TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
`;

export const SEED_SQL = `
INSERT INTO users VALUES
(1,'Alice','alice@test.com','2023-01-01'),
(2,'Bob','bob@test.com','2023-02-01'),
(3,'Charlie','charlie@test.com','2023-03-01'),
(4,'Diana','diana@test.com','2023-04-01'),
(5,'Eve','eve@test.com','2023-05-01'),
(6,'Frank','frank@test.com','2023-06-01'),
(7,'Grace','grace@test.com','2023-07-01'),
(8,'Henry','henry@test.com','2023-08-01');

INSERT INTO products VALUES
(1,'Laptop','Electronics',1200,10),
(2,'Phone','Electronics',800,20),
(3,'Shoes','Clothing',100,50),
(4,'T-shirt','Clothing',25,100),
(5,'Headphones','Electronics',150,30),
(6,'Book','Books',15,200),
(7,'Desk','Furniture',300,5),
(8,'Chair','Furniture',150,15),
(9,'Tablet','Electronics',500,25),
(10,'Jacket','Clothing',200,40);

INSERT INTO orders VALUES
(1,1,'2024-01-01','completed'),
(2,1,'2024-01-10','completed'),
(3,2,'2024-02-01','pending'),
(4,3,'2024-02-10','completed'),
(5,4,'2024-03-01','cancelled'),
(6,1,'2024-03-15','completed'),
(7,2,'2024-04-01','completed'),
(8,5,'2024-04-10','completed'),
(9,3,'2024-05-01','pending'),
(10,6,'2024-05-15','completed');

INSERT INTO order_items VALUES
(1,1,1,1,1200),
(2,1,5,2,150),
(3,2,2,1,800),
(4,3,3,2,100),
(5,4,4,3,25),
(6,5,1,1,1200),
(7,6,6,5,15),
(8,6,4,2,25),
(9,7,9,1,500),
(10,8,7,1,300),
(11,8,8,2,150),
(12,9,2,1,800),
(13,10,10,1,200),
(14,10,3,1,100);

INSERT INTO payments VALUES
(1,1,1500,'card','paid'),
(2,2,800,'card','paid'),
(3,3,200,'vipps','pending'),
(4,4,75,'card','paid'),
(5,5,1200,'card','refunded'),
(6,6,125,'card','paid'),
(7,7,500,'vipps','paid'),
(8,8,600,'card','paid'),
(9,9,800,'card','pending'),
(10,10,300,'vipps','paid');
`;

export interface TableSchema {
  name: string;
  columns: { name: string; type: string }[];
}

export const SCHEMA_REFERENCE: TableSchema[] = [
  {
    name: "users",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "name", type: "TEXT" },
      { name: "email", type: "TEXT" },
      { name: "created_at", type: "DATE" },
    ],
  },
  {
    name: "products",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "name", type: "TEXT" },
      { name: "category", type: "TEXT" },
      { name: "price", type: "NUMERIC" },
      { name: "stock", type: "INTEGER" },
    ],
  },
  {
    name: "orders",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "user_id", type: "INTEGER FK" },
      { name: "created_at", type: "DATE" },
      { name: "status", type: "TEXT" },
    ],
  },
  {
    name: "order_items",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "order_id", type: "INTEGER FK" },
      { name: "product_id", type: "INTEGER FK" },
      { name: "quantity", type: "INTEGER" },
      { name: "price", type: "NUMERIC" },
    ],
  },
  {
    name: "payments",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "order_id", type: "INTEGER FK" },
      { name: "amount", type: "NUMERIC" },
      { name: "method", type: "TEXT" },
      { name: "status", type: "TEXT" },
    ],
  },
];
