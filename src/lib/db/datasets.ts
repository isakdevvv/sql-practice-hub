import { SCHEMA_SQL as ECOM_SCHEMA, SEED_SQL as ECOM_SEED, SCHEMA_REFERENCE as ECOM_REF, type TableSchema } from "./schema";

export type DatasetId = "ecommerce" | "university" | "library";

export interface Dataset {
  id: DatasetId;
  name: string;
  description: string;
  schemaSql: string;
  seedSql: string;
  reference: TableSchema[];
}

// ---------- UNIVERSITY ----------
const UNIVERSITY_SCHEMA = `
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT,
  major TEXT,
  enrolled_year INTEGER
);
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  code TEXT,
  title TEXT,
  credits INTEGER,
  department TEXT
);
CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY,
  student_id INTEGER,
  course_id INTEGER,
  semester TEXT,
  grade TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
CREATE TABLE professors (
  id INTEGER PRIMARY KEY,
  name TEXT,
  department TEXT
);
CREATE TABLE course_professors (
  course_id INTEGER,
  professor_id INTEGER,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (professor_id) REFERENCES professors(id)
);
`;

const UNIVERSITY_SEED = `
INSERT INTO students VALUES
(1,'Alice','CS',2022),(2,'Bob','Math',2021),(3,'Charlie','CS',2023),
(4,'Diana','Physics',2022),(5,'Eve','Math',2023),(6,'Frank','CS',2021),
(7,'Grace','Biology',2022),(8,'Henry','Physics',2023);

INSERT INTO courses VALUES
(1,'CS101','Intro to Programming',5,'CS'),
(2,'CS201','Algorithms',7,'CS'),
(3,'MA101','Calculus I',7,'Math'),
(4,'MA201','Linear Algebra',5,'Math'),
(5,'PH101','Mechanics',5,'Physics'),
(6,'BI101','Cell Biology',5,'Biology');

INSERT INTO enrollments VALUES
(1,1,1,'2022-fall','A'),(2,1,2,'2023-spring','B'),
(3,2,3,'2021-fall','A'),(4,2,4,'2022-spring','A'),
(5,3,1,'2023-fall','B'),(6,4,5,'2022-fall','C'),
(7,5,3,'2023-fall','B'),(8,6,1,'2021-fall','A'),
(9,6,2,'2022-spring','A'),(10,7,6,'2022-fall','B'),
(11,8,5,'2023-fall',NULL),(12,1,3,'2023-fall','A');

INSERT INTO professors VALUES
(1,'Dr. Turing','CS'),(2,'Dr. Noether','Math'),
(3,'Dr. Curie','Physics'),(4,'Dr. Darwin','Biology');

INSERT INTO course_professors VALUES
(1,1),(2,1),(3,2),(4,2),(5,3),(6,4);
`;

const UNIVERSITY_REF: TableSchema[] = [
  { name: "students", columns: [
    { name: "id", type: "INTEGER PK" },
    { name: "name", type: "TEXT" },
    { name: "major", type: "TEXT" },
    { name: "enrolled_year", type: "INTEGER" },
  ]},
  { name: "courses", columns: [
    { name: "id", type: "INTEGER PK" },
    { name: "code", type: "TEXT" },
    { name: "title", type: "TEXT" },
    { name: "credits", type: "INTEGER" },
    { name: "department", type: "TEXT" },
  ]},
  { name: "enrollments", columns: [
    { name: "id", type: "INTEGER PK" },
    { name: "student_id", type: "INTEGER FK" },
    { name: "course_id", type: "INTEGER FK" },
    { name: "semester", type: "TEXT" },
    { name: "grade", type: "TEXT" },
  ]},
  { name: "professors", columns: [
    { name: "id", type: "INTEGER PK" },
    { name: "name", type: "TEXT" },
    { name: "department", type: "TEXT" },
  ]},
  { name: "course_professors", columns: [
    { name: "course_id", type: "INTEGER FK" },
    { name: "professor_id", type: "INTEGER FK" },
  ]},
];

// ---------- LIBRARY ----------
const LIBRARY_SCHEMA = `
CREATE TABLE authors (
  id INTEGER PRIMARY KEY,
  name TEXT,
  country TEXT
);
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT,
  author_id INTEGER,
  genre TEXT,
  published_year INTEGER,
  FOREIGN KEY (author_id) REFERENCES authors(id)
);
CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  name TEXT,
  joined DATE
);
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  book_id INTEGER,
  member_id INTEGER,
  loaned_at DATE,
  returned_at DATE,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);
`;

const LIBRARY_SEED = `
INSERT INTO authors VALUES
(1,'Tolkien','UK'),(2,'Rowling','UK'),(3,'Murakami','Japan'),
(4,'Atwood','Canada'),(5,'Borges','Argentina');

INSERT INTO books VALUES
(1,'The Hobbit',1,'Fantasy',1937),
(2,'The Lord of the Rings',1,'Fantasy',1954),
(3,'Harry Potter 1',2,'Fantasy',1997),
(4,'Norwegian Wood',3,'Fiction',1987),
(5,'1Q84',3,'Fiction',2009),
(6,'The Handmaids Tale',4,'Fiction',1985),
(7,'Ficciones',5,'Fiction',1944),
(8,'Harry Potter 2',2,'Fantasy',1998);

INSERT INTO members VALUES
(1,'Anna','2023-01-15'),(2,'Ben','2023-03-10'),
(3,'Cara','2024-01-05'),(4,'Dan','2024-02-20'),
(5,'Ella','2024-05-01');

INSERT INTO loans VALUES
(1,1,1,'2024-01-10','2024-01-20'),
(2,3,2,'2024-02-01','2024-02-15'),
(3,4,1,'2024-03-01',NULL),
(4,2,3,'2024-03-10','2024-03-25'),
(5,7,4,'2024-04-01',NULL),
(6,5,2,'2024-04-15','2024-04-30'),
(7,3,5,'2024-05-10',NULL),
(8,8,1,'2024-06-01','2024-06-12');
`;

const LIBRARY_REF: TableSchema[] = [
  { name: "authors", columns: [
    { name: "id", type: "INTEGER PK" },
    { name: "name", type: "TEXT" },
    { name: "country", type: "TEXT" },
  ]},
  { name: "books", columns: [
    { name: "id", type: "INTEGER PK" },
    { name: "title", type: "TEXT" },
    { name: "author_id", type: "INTEGER FK" },
    { name: "genre", type: "TEXT" },
    { name: "published_year", type: "INTEGER" },
  ]},
  { name: "members", columns: [
    { name: "id", type: "INTEGER PK" },
    { name: "name", type: "TEXT" },
    { name: "joined", type: "DATE" },
  ]},
  { name: "loans", columns: [
    { name: "id", type: "INTEGER PK" },
    { name: "book_id", type: "INTEGER FK" },
    { name: "member_id", type: "INTEGER FK" },
    { name: "loaned_at", type: "DATE" },
    { name: "returned_at", type: "DATE" },
  ]},
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
  university: {
    id: "university",
    name: "University",
    description: "Students, courses, enrollments, professors.",
    schemaSql: UNIVERSITY_SCHEMA,
    seedSql: UNIVERSITY_SEED,
    reference: UNIVERSITY_REF,
  },
  library: {
    id: "library",
    name: "Library",
    description: "Authors, books, members, loans.",
    schemaSql: LIBRARY_SCHEMA,
    seedSql: LIBRARY_SEED,
    reference: LIBRARY_REF,
  },
};

export const DATASET_LIST: Dataset[] = [DATASETS.ecommerce, DATASETS.university, DATASETS.library];

export function getDataset(id: DatasetId): Dataset {
  return DATASETS[id] ?? DATASETS.ecommerce;
}
