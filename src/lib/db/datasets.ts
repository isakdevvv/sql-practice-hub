import {
  SCHEMA_SQL as ECOM_SCHEMA,
  SEED_SQL as ECOM_SEED,
  SCHEMA_REFERENCE as ECOM_REF,
  type TableSchema,
} from "./schema";

export type DatasetId = "ecommerce" | "library" | "employee" | "blank";

export interface Dataset {
  id: DatasetId;
  name: string;
  description: string;
  schemaSql: string;
  seedSql: string;
  reference: TableSchema[];
}

// ---------- LIBRARY ----------
const LIBRARY_SCHEMA = `
CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  joined_at DATE,
  status TEXT
);
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT,
  author TEXT,
  genre TEXT,
  year INTEGER,
  copies INTEGER
);
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  member_id INTEGER,
  book_id INTEGER,
  borrowed_at DATE,
  returned_at DATE,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);
CREATE TABLE reservations (
  id INTEGER PRIMARY KEY,
  member_id INTEGER,
  book_id INTEGER,
  reserved_at DATE,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);
CREATE TABLE staff (
  id INTEGER PRIMARY KEY,
  name TEXT,
  role TEXT,
  manager_id INTEGER,
  hired_at DATE,
  FOREIGN KEY (manager_id) REFERENCES staff(id)
);
`;

const LIBRARY_SEED = `
INSERT INTO members VALUES
(1,'Anna','anna@test.com','2023-01-15','active'),
(2,'Ben','ben@test.com','2023-03-10','active'),
(3,'Cara','cara@test.com','2024-01-05','active'),
(4,'Dan','dan@test.com','2024-02-20','active'),
(5,'Ella','ella@test.com','2024-05-01','active'),
(6,'Frank','frank@test.com','2023-06-12','active'),
(7,'Gina','gina@test.com','2023-09-22','active'),
(8,'Hugo','hugo@test.com','2024-03-18','active'),
(9,'Ida','ida@test.com','2023-11-04','suspended'),
(10,'Jonas','jonas@test.com','2024-04-09','active'),
(11,'Kari','kari@test.com','2024-06-01','active'),
(12,'Lars','lars@test.com','2024-07-15','active');

INSERT INTO books VALUES
(1,'The Hobbit','Tolkien','Fantasy',1937,3),
(2,'The Lord of the Rings','Tolkien','Fantasy',1954,2),
(3,'Harry Potter 1','Rowling','Fantasy',1997,4),
(4,'Norwegian Wood','Murakami','Fiction',1987,2),
(5,'1Q84','Murakami','Fiction',2009,1),
(6,'The Handmaids Tale','Atwood','Fiction',1985,2),
(7,'Ficciones','Borges','Fiction',1944,1),
(8,'Harry Potter 2','Rowling','Fantasy',1998,3),
(9,'A Brief History of Time','Hawking','Science',1988,2),
(10,'Sapiens','Harari','Science',2011,3),
(11,'Cosmos','Sagan','Science',1980,1),
(12,'The Silmarillion','Tolkien','Fantasy',1977,1),
(13,'Kafka on the Shore','Murakami','Fiction',2002,2),
(14,'Selfish Gene','Dawkins','Science',1976,2),
(15,'Untouched Tome','Unknown','Mystery',2020,1);

INSERT INTO loans VALUES
(1,1,1,'2024-01-10','2024-01-20'),
(2,2,3,'2024-02-01','2024-02-15'),
(3,1,4,'2024-03-01',NULL),
(4,3,2,'2024-03-10','2024-03-25'),
(5,4,7,'2024-04-01',NULL),
(6,2,5,'2024-04-15','2024-04-30'),
(7,5,3,'2024-05-10',NULL),
(8,1,8,'2024-06-01','2024-06-12'),
(9,3,6,'2024-06-15','2024-06-30'),
(10,4,1,'2024-07-01','2024-07-14'),
(11,6,9,'2024-07-05','2024-07-20'),
(12,7,10,'2024-07-10',NULL),
(13,8,11,'2024-07-15','2024-07-28'),
(14,2,14,'2024-08-01','2024-08-15'),
(15,3,4,'2024-08-05','2024-08-20'),
(16,1,13,'2024-08-10','2024-08-22'),
(17,5,6,'2024-08-15',NULL),
(18,6,3,'2024-09-01','2024-09-15'),
(19,7,2,'2024-09-05','2024-09-20'),
(20,8,9,'2024-09-10','2024-09-25'),
(21,10,8,'2024-09-15','2024-09-28'),
(22,11,1,'2024-10-01','2024-10-12'),
(23,12,10,'2024-10-05','2024-10-18'),
(24,1,2,'2024-10-10','2024-10-25'),
(25,2,11,'2024-10-15','2024-10-30');

INSERT INTO reservations VALUES
(1,5,1,'2024-11-01'),
(2,6,3,'2024-11-03'),
(3,7,8,'2024-11-05'),
(4,1,5,'2024-11-08'),
(5,4,2,'2024-11-10'),
(6,8,3,'2024-11-12');

INSERT INTO staff VALUES
(1,'Olav','Head Librarian',NULL,'2018-01-15'),
(2,'Petra','Branch Manager',1,'2019-03-20'),
(3,'Quinn','Branch Manager',1,'2020-05-10'),
(4,'Reidar','Senior Librarian',2,'2021-02-12'),
(5,'Sara','Librarian',4,'2022-06-01'),
(6,'Tor','Librarian',4,'2022-09-15'),
(7,'Una','Librarian',3,'2023-01-10'),
(8,'Vidar','Assistant',7,'2024-04-05');
`;

const LIBRARY_REF: TableSchema[] = [
  {
    name: "members",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "name", type: "TEXT" },
      { name: "email", type: "TEXT" },
      { name: "joined_at", type: "DATE" },
      { name: "status", type: "TEXT" },
    ],
  },
  {
    name: "books",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "title", type: "TEXT" },
      { name: "author", type: "TEXT" },
      { name: "genre", type: "TEXT" },
      { name: "year", type: "INTEGER" },
      { name: "copies", type: "INTEGER" },
    ],
  },
  {
    name: "loans",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "member_id", type: "INTEGER FK" },
      { name: "book_id", type: "INTEGER FK" },
      { name: "borrowed_at", type: "DATE" },
      { name: "returned_at", type: "DATE" },
    ],
  },
  {
    name: "reservations",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "member_id", type: "INTEGER FK" },
      { name: "book_id", type: "INTEGER FK" },
      { name: "reserved_at", type: "DATE" },
    ],
  },
  {
    name: "staff",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "name", type: "TEXT" },
      { name: "role", type: "TEXT" },
      { name: "manager_id", type: "INTEGER FK" },
      { name: "hired_at", type: "DATE" },
    ],
  },
];

// ---------- EMPLOYEE ----------
const EMPLOYEE_SCHEMA = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT,
  location TEXT
);
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  department_id INTEGER,
  manager_id INTEGER,
  salary NUMERIC,
  hire_date DATE,
  role TEXT,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (manager_id) REFERENCES employees(id)
);
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT,
  department_id INTEGER,
  budget NUMERIC,
  start_date DATE,
  end_date DATE,
  status TEXT,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);
CREATE TABLE assignments (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER,
  project_id INTEGER,
  hours INTEGER,
  role TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
CREATE TABLE salary_history (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER,
  salary NUMERIC,
  effective_from DATE,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
`;

const EMPLOYEE_SEED = `
INSERT INTO departments VALUES
(1,'Accounting','Oslo'),
(2,'Engineering','Bergen'),
(3,'Sales','Trondheim'),
(4,'Operations','Stavanger');

INSERT INTO employees VALUES
(1,'King',1,NULL,1500000,'2010-01-15','CEO'),
(2,'Clark',1,1,1100000,'2012-06-09','Manager'),
(3,'Blake',3,1,1050000,'2013-05-01','Manager'),
(4,'Jones',2,1,1150000,'2011-04-02','Manager'),
(5,'Smith',2,4,720000,'2018-12-17','Engineer'),
(6,'Allen',3,3,820000,'2019-02-20','Salesman'),
(7,'Ward',3,3,780000,'2019-02-22','Salesman'),
(8,'Martin',3,3,790000,'2020-09-28','Salesman'),
(9,'Scott',2,4,950000,'2017-04-19','Senior Engineer'),
(10,'Turner',3,3,830000,'2020-09-08','Salesman'),
(11,'Adams',2,9,650000,'2021-05-23','Engineer'),
(12,'James',3,3,620000,'2021-12-03','Clerk'),
(13,'Ford',2,4,940000,'2016-12-03','Senior Engineer'),
(14,'Miller',1,2,680000,'2022-01-23','Clerk'),
(15,'Nash',2,9,700000,'2022-03-15','Engineer'),
(16,'Owens',1,2,720000,'2021-08-20','Accountant'),
(17,'Park',2,13,690000,'2023-02-10','Engineer'),
(18,'Quinn',4,1,860000,'2019-07-15','Operations Lead'),
(19,'Reed',4,18,640000,'2022-09-01','Operator'),
(20,'Stein',4,18,620000,'2023-04-12','Operator');

INSERT INTO projects VALUES
(1,'Atlas',2,2500000,'2024-01-15',NULL,'active'),
(2,'Bedrock',2,1800000,'2024-03-01',NULL,'active'),
(3,'Comet',3,950000,'2024-02-10',NULL,'active'),
(4,'Delta',1,500000,'2024-04-05',NULL,'active'),
(5,'Echo',2,1200000,'2023-01-10','2023-12-20','completed'),
(6,'Foxtrot',3,800000,'2023-03-15','2023-11-30','completed'),
(7,'Gamma',4,600000,'2023-05-01','2024-01-15','completed'),
(8,'Halt',4,400000,'2023-06-01','2023-08-15','cancelled');

INSERT INTO assignments VALUES
(1,5,1,120,'Developer'),
(2,9,1,150,'Lead'),
(3,11,1,80,'Developer'),
(4,13,1,140,'Lead'),
(5,15,2,100,'Developer'),
(6,17,2,90,'Developer'),
(7,9,2,60,'Reviewer'),
(8,6,3,110,'Sales'),
(9,7,3,100,'Sales'),
(10,8,3,90,'Sales'),
(11,10,3,95,'Sales'),
(12,16,4,70,'Accountant'),
(13,2,4,40,'Manager'),
(14,5,5,200,'Developer'),
(15,9,5,180,'Lead'),
(16,11,5,150,'Developer'),
(17,13,5,170,'Lead'),
(18,6,6,160,'Sales'),
(19,7,6,140,'Sales'),
(20,8,6,130,'Sales'),
(21,18,7,180,'Lead'),
(22,19,7,150,'Operator'),
(23,20,7,140,'Operator'),
(24,4,1,30,'Manager'),
(25,4,2,25,'Manager'),
(26,3,3,20,'Manager'),
(27,18,4,15,'Reviewer'),
(28,15,5,160,'Developer'),
(29,17,5,140,'Developer'),
(30,5,2,80,'Developer');

INSERT INTO salary_history VALUES
(1,1,1200000,'2010-01-15'),
(2,1,1350000,'2015-01-15'),
(3,1,1500000,'2020-01-15'),
(4,2,900000,'2012-06-09'),
(5,2,1000000,'2017-06-09'),
(6,2,1100000,'2022-06-09'),
(7,3,850000,'2013-05-01'),
(8,3,950000,'2018-05-01'),
(9,3,1050000,'2023-05-01'),
(10,4,950000,'2011-04-02'),
(11,4,1050000,'2016-04-02'),
(12,4,1150000,'2021-04-02'),
(13,5,600000,'2018-12-17'),
(14,5,720000,'2023-12-17'),
(15,6,700000,'2019-02-20'),
(16,6,820000,'2024-02-20'),
(17,7,680000,'2019-02-22'),
(18,7,780000,'2024-02-22'),
(19,8,720000,'2020-09-28'),
(20,8,790000,'2024-09-28'),
(21,9,800000,'2017-04-19'),
(22,9,950000,'2023-04-19'),
(23,10,750000,'2020-09-08'),
(24,10,830000,'2024-09-08'),
(25,11,580000,'2021-05-23'),
(26,11,650000,'2024-05-23'),
(27,12,560000,'2021-12-03'),
(28,12,620000,'2024-12-03'),
(29,13,820000,'2016-12-03'),
(30,13,940000,'2023-12-03'),
(31,14,620000,'2022-01-23'),
(32,15,640000,'2022-03-15'),
(33,15,700000,'2024-03-15'),
(34,16,680000,'2021-08-20'),
(35,17,690000,'2023-02-10');
`;

const EMPLOYEE_REF: TableSchema[] = [
  {
    name: "departments",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "name", type: "TEXT" },
      { name: "location", type: "TEXT" },
    ],
  },
  {
    name: "employees",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "name", type: "TEXT" },
      { name: "department_id", type: "INTEGER FK" },
      { name: "manager_id", type: "INTEGER FK" },
      { name: "salary", type: "NUMERIC" },
      { name: "hire_date", type: "DATE" },
      { name: "role", type: "TEXT" },
    ],
  },
  {
    name: "projects",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "name", type: "TEXT" },
      { name: "department_id", type: "INTEGER FK" },
      { name: "budget", type: "NUMERIC" },
      { name: "start_date", type: "DATE" },
      { name: "end_date", type: "DATE" },
      { name: "status", type: "TEXT" },
    ],
  },
  {
    name: "assignments",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "employee_id", type: "INTEGER FK" },
      { name: "project_id", type: "INTEGER FK" },
      { name: "hours", type: "INTEGER" },
      { name: "role", type: "TEXT" },
    ],
  },
  {
    name: "salary_history",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "employee_id", type: "INTEGER FK" },
      { name: "salary", type: "NUMERIC" },
      { name: "effective_from", type: "DATE" },
    ],
  },
];

// ---------- BLANK ----------
const BLANK_SCHEMA = "";
const BLANK_SEED = "";
const BLANK_REF: TableSchema[] = [
  {
    name: "(tom)",
    columns: [{ name: "Du oppretter selv tabellene", type: "" }],
  },
];

export const DATASETS: Record<DatasetId, Dataset> = {
  ecommerce: {
    id: "ecommerce",
    name: "E-commerce",
    description: "Users, products, orders, payments — classic online shop.",
    schemaSql: ECOM_SCHEMA,
    seedSql: ECOM_SEED,
    reference: ECOM_REF,
  },
  library: {
    id: "library",
    name: "Library",
    description: "Members, books, loans, reservations, staff — borrowing system.",
    schemaSql: LIBRARY_SCHEMA,
    seedSql: LIBRARY_SEED,
    reference: LIBRARY_REF,
  },
  employee: {
    id: "employee",
    name: "Employee",
    description: "Departments, employees, projects, assignments, salary history.",
    schemaSql: EMPLOYEE_SCHEMA,
    seedSql: EMPLOYEE_SEED,
    reference: EMPLOYEE_REF,
  },
  blank: {
    id: "blank",
    name: "Sandbox",
    description: "Empty database — use CREATE TABLE yourself for DDL practice.",
    schemaSql: BLANK_SCHEMA,
    seedSql: BLANK_SEED,
    reference: BLANK_REF,
  },
};

export const DATASET_LIST: Dataset[] = [
  DATASETS.ecommerce,
  DATASETS.library,
  DATASETS.employee,
  DATASETS.blank,
];

export function getDataset(id: DatasetId): Dataset {
  return DATASETS[id] ?? DATASETS.ecommerce;
}
