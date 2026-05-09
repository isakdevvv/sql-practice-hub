import {
  SCHEMA_SQL as ECOM_SCHEMA,
  SEED_SQL as ECOM_SEED,
  SCHEMA_REFERENCE as ECOM_REF,
  type TableSchema,
} from "./schema";

export type DatasetId =
  | "ecommerce"
  | "university"
  | "library"
  | "film"
  | "employee"
  | "reise"
  | "renhold"
  | "hobbyhus"
  | "bibliotek"
  | "land"
  | "sykkelutleie"
  | "forsikring"
  | "flyplass"
  | "bilsalg"
  | "blank";

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
  {
    name: "students",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "name", type: "TEXT" },
      { name: "major", type: "TEXT" },
      { name: "enrolled_year", type: "INTEGER" },
    ],
  },
  {
    name: "courses",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "code", type: "TEXT" },
      { name: "title", type: "TEXT" },
      { name: "credits", type: "INTEGER" },
      { name: "department", type: "TEXT" },
    ],
  },
  {
    name: "enrollments",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "student_id", type: "INTEGER FK" },
      { name: "course_id", type: "INTEGER FK" },
      { name: "semester", type: "TEXT" },
      { name: "grade", type: "TEXT" },
    ],
  },
  {
    name: "professors",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "name", type: "TEXT" },
      { name: "department", type: "TEXT" },
    ],
  },
  {
    name: "course_professors",
    columns: [
      { name: "course_id", type: "INTEGER FK" },
      { name: "professor_id", type: "INTEGER FK" },
    ],
  },
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
  {
    name: "authors",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "name", type: "TEXT" },
      { name: "country", type: "TEXT" },
    ],
  },
  {
    name: "books",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "title", type: "TEXT" },
      { name: "author_id", type: "INTEGER FK" },
      { name: "genre", type: "TEXT" },
      { name: "published_year", type: "INTEGER" },
    ],
  },
  {
    name: "members",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "name", type: "TEXT" },
      { name: "joined", type: "DATE" },
    ],
  },
  {
    name: "loans",
    columns: [
      { name: "id", type: "INTEGER PK" },
      { name: "book_id", type: "INTEGER FK" },
      { name: "member_id", type: "INTEGER FK" },
      { name: "loaned_at", type: "DATE" },
      { name: "returned_at", type: "DATE" },
    ],
  },
];

// ---------- FILM (DTE-2509 exam practice) ----------
const FILM_SCHEMA = `
CREATE TABLE film (
  fnr INTEGER PRIMARY KEY,
  tittel TEXT,
  aar INTEGER,
  land TEXT,
  sjanger TEXT,
  alder INTEGER,
  tid INTEGER,
  pris NUMERIC
);
`;

const FILM_SEED = `
INSERT INTO film VALUES
(1,'Casablanca',1942,'USA','Drama',15,102,149.00),
(2,'Fort Apache',1948,'USA','Western',15,127,NULL),
(3,'Apocalypse Now',1979,'USA','Action',18,155,123.00),
(4,'Streets of Fire',1984,'USA','Action',15,93,NULL),
(5,'High Noon',1952,'USA','Western',15,85,123.00),
(6,'Cinema Paradiso',1988,'Italia','Komedie',11,123,NULL),
(7,'Asterix hos Britene',1988,'Frankrike','Tegnefilm',7,78,149.00),
(8,'Veiviseren',1987,'Norge','Action',15,96,87.00),
(9,'Salmer fra kjokkenet',2002,'Norge','Komedie',7,80,149.00),
(10,'Anastasia',1997,'USA','Tegnefilm',7,94,123.00),
(11,'La Grande bouffe',1973,'Frankrike','Drama',15,129,87.00),
(12,'Blues Brothers 2000',1998,'USA','Komedie',11,124,135.00),
(13,'Beatles: Help',1965,'Storbritannia','Musikk',11,144,NULL);
`;

const FILM_REF: TableSchema[] = [
  {
    name: "film",
    columns: [
      { name: "fnr", type: "INTEGER PK" },
      { name: "tittel", type: "TEXT" },
      { name: "aar", type: "INTEGER" },
      { name: "land", type: "TEXT" },
      { name: "sjanger", type: "TEXT" },
      { name: "alder", type: "INTEGER" },
      { name: "tid", type: "INTEGER" },
      { name: "pris", type: "NUMERIC" },
    ],
  },
];

// ---------- EMPLOYEE (Oblig 1 — emp/dept) ----------
const EMPLOYEE_SCHEMA = `
CREATE TABLE dept (
  deptno INTEGER PRIMARY KEY,
  dname TEXT,
  loc TEXT
);
CREATE TABLE emp (
  empno INTEGER PRIMARY KEY,
  ename TEXT,
  job TEXT,
  mgr INTEGER,
  hiredate DATE,
  sal NUMERIC,
  comm NUMERIC,
  deptno INTEGER,
  FOREIGN KEY (deptno) REFERENCES dept(deptno),
  FOREIGN KEY (mgr) REFERENCES emp(empno)
);
`;

const EMPLOYEE_SEED = `
INSERT INTO dept VALUES
(1,'Accounting','New York'),
(2,'Research','Dallas'),
(3,'Sales','Chicago'),
(4,'Operations','Boston');

INSERT INTO emp VALUES
(7369,'Smith','Clerk',7902,'1980-12-17',800,NULL,2),
(7499,'Allen','Salesman',7698,'1981-02-20',1600,300,3),
(7521,'Ward','Salesman',7698,'1981-02-22',1250,500,3),
(7566,'Jones','Manager',7839,'1981-04-02',2975,NULL,2),
(7654,'Martin','Salesman',7698,'1981-09-28',1250,1400,3),
(7698,'Blake','Manager',7839,'1981-05-01',2850,NULL,3),
(7782,'Clark','Manager',7839,'1981-06-09',2450,NULL,1),
(7788,'Scott','Analyst',7566,'1987-04-19',3000,NULL,2),
(7839,'King','President',NULL,'1981-11-17',5000,NULL,1),
(7844,'Turner','Salesman',7698,'1981-09-08',1500,0,3),
(7876,'Adams','Clerk',7788,'1987-05-23',1100,NULL,2),
(7900,'James','Clerk',7698,'1981-12-03',950,NULL,3),
(7902,'Ford','Analyst',7566,'1981-12-03',3000,NULL,2),
(7934,'Miller','Clerk',7782,'1982-01-23',1300,NULL,1);
`;

const EMPLOYEE_REF: TableSchema[] = [
  {
    name: "dept",
    columns: [
      { name: "deptno", type: "INTEGER PK" },
      { name: "dname", type: "TEXT" },
      { name: "loc", type: "TEXT" },
    ],
  },
  {
    name: "emp",
    columns: [
      { name: "empno", type: "INTEGER PK" },
      { name: "ename", type: "TEXT" },
      { name: "job", type: "TEXT" },
      { name: "mgr", type: "INTEGER FK" },
      { name: "hiredate", type: "DATE" },
      { name: "sal", type: "NUMERIC" },
      { name: "comm", type: "NUMERIC" },
      { name: "deptno", type: "INTEGER FK" },
    ],
  },
];

// ---------- REISE (DAT1000 Vår 2025 — reisebyrå) ----------
const REISE_SCHEMA = `
CREATE TABLE Kunde (
  KundeID INTEGER PRIMARY KEY,
  Fornavn TEXT,
  Etternavn TEXT,
  Mobil TEXT
);
CREATE TABLE Destinasjon (
  DestID INTEGER PRIMARY KEY,
  Navn TEXT,
  Land TEXT
);
CREATE TABLE Reise (
  ReiseID INTEGER PRIMARY KEY,
  DestID INTEGER,
  AvreiseDato DATE,
  PrisPrPerson NUMERIC,
  FOREIGN KEY (DestID) REFERENCES Destinasjon(DestID)
);
CREATE TABLE Bestilling (
  BestID INTEGER PRIMARY KEY,
  KundeID INTEGER,
  ReiseID INTEGER,
  BestDato DATE,
  AntPerson INTEGER,
  FOREIGN KEY (KundeID) REFERENCES Kunde(KundeID),
  FOREIGN KEY (ReiseID) REFERENCES Reise(ReiseID)
);
`;

const REISE_SEED = `
INSERT INTO Kunde VALUES
(1,'Ola','Nordmann','40000001'),
(2,'Kari','Hansen','40000002'),
(3,'Per','Olsen','40000003'),
(4,'Anna','Berg','40000004'),
(5,'Liu','Wang','40000005'),
(6,'Maria','Gonzalez','40000006');

INSERT INTO Destinasjon VALUES
(1,'Paris','Frankrike'),
(2,'Provence','Frankrike'),
(3,'Roma','Italia'),
(4,'Palermo','Italia'),
(5,'London','Storbritannia'),
(6,'Praha','Tsjekkia'),
(7,'Madrid','Spania'),
(8,'Pisa','Italia');

INSERT INTO Reise VALUES
(1,1,'2025-07-05',4500),
(2,2,'2025-07-12',5200),
(3,3,'2025-07-20',4800),
(4,4,'2025-08-02',6000),
(5,5,'2025-06-15',7000),
(6,1,'2025-09-01',4200),
(7,6,'2025-07-22',3500),
(8,7,'2025-08-15',5500),
(9,8,'2025-07-08',4900),
(10,3,'2025-12-04',5300);

INSERT INTO Bestilling VALUES
(1,1,1,'2025-04-10',2),
(2,2,2,'2025-05-02',3),
(3,3,3,'2025-05-15',2),
(4,1,4,'2025-06-01',4),
(5,4,1,'2025-04-25',1),
(6,5,5,'2025-03-10',2),
(7,6,7,'2025-06-20',2),
(8,2,9,'2025-05-30',3),
(9,3,6,'2025-07-15',1),
(10,4,3,'2025-05-22',2);
`;

const REISE_REF: TableSchema[] = [
  {
    name: "Kunde",
    columns: [
      { name: "KundeID", type: "INTEGER PK" },
      { name: "Fornavn", type: "TEXT" },
      { name: "Etternavn", type: "TEXT" },
      { name: "Mobil", type: "TEXT" },
    ],
  },
  {
    name: "Destinasjon",
    columns: [
      { name: "DestID", type: "INTEGER PK" },
      { name: "Navn", type: "TEXT" },
      { name: "Land", type: "TEXT" },
    ],
  },
  {
    name: "Reise",
    columns: [
      { name: "ReiseID", type: "INTEGER PK" },
      { name: "DestID", type: "INTEGER FK" },
      { name: "AvreiseDato", type: "DATE" },
      { name: "PrisPrPerson", type: "NUMERIC" },
    ],
  },
  {
    name: "Bestilling",
    columns: [
      { name: "BestID", type: "INTEGER PK" },
      { name: "KundeID", type: "INTEGER FK" },
      { name: "ReiseID", type: "INTEGER FK" },
      { name: "BestDato", type: "DATE" },
      { name: "AntPerson", type: "INTEGER" },
    ],
  },
];

// ---------- RENHOLD (DAT1000 Høst 2024 — bolig/avtale) ----------
const RENHOLD_SCHEMA = `
CREATE TABLE Kunde (
  KNr INTEGER PRIMARY KEY,
  Fornavn TEXT,
  Etternavn TEXT,
  Mobil TEXT
);
CREATE TABLE Bolig (
  BNr INTEGER PRIMARY KEY,
  Adresse TEXT,
  PostNr TEXT,
  Kvm INTEGER,
  AntBad INTEGER,
  KNr INTEGER,
  FOREIGN KEY (KNr) REFERENCES Kunde(KNr)
);
CREATE TABLE Avtaletype (
  TNr INTEGER PRIMARY KEY,
  Beskrivelse TEXT,
  KvmPris NUMERIC
);
CREATE TABLE Avtale (
  ANr INTEGER PRIMARY KEY,
  BNr INTEGER,
  TNr INTEGER,
  Fra DATE,
  Ukedag TEXT,
  DagerPrMnd INTEGER,
  FOREIGN KEY (BNr) REFERENCES Bolig(BNr),
  FOREIGN KEY (TNr) REFERENCES Avtaletype(TNr)
);
`;

const RENHOLD_SEED = `
INSERT INTO Kunde VALUES
(1,'Liu','Wang','56789012'),
(2,'Ola','Lie','12345678'),
(3,'Kari','Olsen','23456789'),
(4,'Peder','Aas','34567890'),
(5,'Maria','Gonzalez','45678901');

INSERT INTO Bolig VALUES
(1,'Storgata 1','0123',102,2,1),
(2,'Lillegata 2','0234',75,1,4),
(3,'Mellomveien 3','0345',120,2,3),
(4,'Bakgata 4','0456',90,1,4),
(5,'Framveien 5','0567',110,2,5),
(6,'Rundveien 6','0678',85,1,5);

INSERT INTO Avtaletype VALUES
(1,'Storrengjoring',50.00),
(2,'Lett renhold',20.00),
(3,'Stovtorking',35.00),
(4,'Rydding',25.00);

INSERT INTO Avtale VALUES
(1,1,1,'2023-12-01','mandag',1),
(2,2,2,'2024-03-01','mandag',3),
(3,3,3,'2024-03-10','onsdag',2),
(4,4,1,'2024-08-20','mandag',2),
(5,5,2,'2024-08-25','torsdag',1),
(6,6,3,'2024-10-01','onsdag',2);
`;

const RENHOLD_REF: TableSchema[] = [
  {
    name: "Kunde",
    columns: [
      { name: "KNr", type: "INTEGER PK" },
      { name: "Fornavn", type: "TEXT" },
      { name: "Etternavn", type: "TEXT" },
      { name: "Mobil", type: "TEXT" },
    ],
  },
  {
    name: "Bolig",
    columns: [
      { name: "BNr", type: "INTEGER PK" },
      { name: "Adresse", type: "TEXT" },
      { name: "PostNr", type: "TEXT" },
      { name: "Kvm", type: "INTEGER" },
      { name: "AntBad", type: "INTEGER" },
      { name: "KNr", type: "INTEGER FK" },
    ],
  },
  {
    name: "Avtaletype",
    columns: [
      { name: "TNr", type: "INTEGER PK" },
      { name: "Beskrivelse", type: "TEXT" },
      { name: "KvmPris", type: "NUMERIC" },
    ],
  },
  {
    name: "Avtale",
    columns: [
      { name: "ANr", type: "INTEGER PK" },
      { name: "BNr", type: "INTEGER FK" },
      { name: "TNr", type: "INTEGER FK" },
      { name: "Fra", type: "DATE" },
      { name: "Ukedag", type: "TEXT" },
      { name: "DagerPrMnd", type: "INTEGER" },
    ],
  },
];

// ---------- HOBBYHUS (kapittel 4 — Hobbyhuset, redusert) ----------
const HOBBYHUS_SCHEMA = `
CREATE TABLE Poststed (
  PostNr TEXT PRIMARY KEY,
  Poststed TEXT NOT NULL
);
CREATE TABLE Kategori (
  KatNr INTEGER PRIMARY KEY,
  Navn TEXT
);
CREATE TABLE Vare (
  VNr TEXT PRIMARY KEY,
  Betegnelse TEXT NOT NULL,
  Pris NUMERIC NOT NULL,
  KatNr INTEGER,
  Antall INTEGER NOT NULL,
  Hylle TEXT,
  FOREIGN KEY (KatNr) REFERENCES Kategori(KatNr)
);
CREATE TABLE Ansatt (
  AnsNr INTEGER PRIMARY KEY,
  Fornavn TEXT NOT NULL,
  Etternavn TEXT NOT NULL,
  Adresse TEXT,
  PostNr TEXT NOT NULL,
  Fodselsdato DATE,
  Kjonn TEXT,
  Stilling TEXT,
  Aarslonn NUMERIC NOT NULL,
  FOREIGN KEY (PostNr) REFERENCES Poststed(PostNr)
);
CREATE TABLE Kunde (
  KNr INTEGER PRIMARY KEY,
  Fornavn TEXT NOT NULL,
  Etternavn TEXT NOT NULL,
  Adresse TEXT NOT NULL,
  PostNr TEXT NOT NULL,
  FOREIGN KEY (PostNr) REFERENCES Poststed(PostNr)
);
CREATE TABLE Ordre (
  OrdreNr INTEGER PRIMARY KEY,
  OrdreDato DATE NOT NULL,
  SendtDato DATE,
  BetaltDato DATE,
  KNr INTEGER NOT NULL,
  FOREIGN KEY (KNr) REFERENCES Kunde(KNr)
);
CREATE TABLE Ordrelinje (
  OrdreNr INTEGER,
  VNr TEXT,
  PrisPrEnhet NUMERIC NOT NULL,
  Antall INTEGER NOT NULL,
  PRIMARY KEY (OrdreNr, VNr),
  FOREIGN KEY (OrdreNr) REFERENCES Ordre(OrdreNr),
  FOREIGN KEY (VNr) REFERENCES Vare(VNr)
);
`;

const HOBBYHUS_SEED = `
INSERT INTO Poststed VALUES
('0150','OSLO'),('0250','OSLO'),('1300','SANDVIKA'),('1701','SARPSBORG'),
('2200','KONGSVINGER'),('3041','DRAMMEN'),('3800','BO I TELEMARK'),
('3810','GVARV'),('3840','SELJORD'),('5000','BERGEN'),
('7003','TRONDHEIM'),('9013','TROMSO');

INSERT INTO Kategori VALUES
(1,'Hageutstyr'),(2,'Hobbymaling'),(3,'Keramikk'),(4,'Konfekt og marsipan'),
(6,'Tekstil, søm og strikking'),(10,'Bøker'),(11,'Leker'),(12,'Hagemøbler'),
(13,'Dukker og nisser'),(15,'Blomsterfrø'),(17,'Dekorasjoner'),(21,'Gjødsel');

INSERT INTO Vare VALUES
('10820','Dukkehår, hvitt',66.50,13,106,'E12'),
('10830','Nisseskjegg, 30 cm',83.50,13,42,NULL),
('22054','Vannkanne, 5 ltr.',101.50,1,24,'A27'),
('22165','Hafa gressklipper G8, bensin',7763.00,1,16,'A01'),
('25079','Trillebår',480.00,1,46,'A11'),
('25131','Juwa Motorsag XY65',1550.00,1,42,'A29'),
('33044','Blandet blomsterfrø',20.50,15,1080,'E05'),
('33045','Blomkarse',25.50,15,1206,'E05'),
('41096','Blåleire, 10kg',165.00,3,460,'B02'),
('42929','Pepperkakeformer',119.00,4,38,'B09'),
('44939','Hobbymaling, 6 farger',165.00,2,2,'B02'),
('55129','Lek med lakris',221.00,10,64,'C20'),
('55130','Moro med marsipan',429.50,10,140,'C20'),
('65060','Strandtennis',66.50,11,94,'C31'),
('65070','Boule',170.50,11,100,'C31'),
('77249','Hagebenk, furu',2240.00,12,4,'F01'),
('77251','Bord, 102 cm diameter',946.00,12,68,'F03'),
('77277','Parasoll, 2.5 meter, stål',515.00,12,18,'F02'),
('80088','Fullgjødsel, 40 kg',306.00,21,452,'E20'),
('90510','Kakestativ',619.50,4,60,'B17');

INSERT INTO Ansatt VALUES
(1,'Georg','Barth','Kringsjågrenda 3F','3041','1988-03-20','M','Lagerleder',756100.00),
(2,'Gunnlaug','Angeltveit','Langmyrgrenda 9','3800','1974-08-29','K','Markedssjef',804000.00),
(3,'Morgan','Dalland','Jansbergveien 19','3041','1979-06-10','M','Innkjøper',838100.00),
(6,'Vilde','Aksnes','Minister Ditleffs vei 44','3810','1983-03-11','K','Databaseadministrator',866500.00),
(7,'Henriette','Brobakken','Stubberud Sognsvann 1','3800','1977-03-01','K','Daglig leder',1042300.00),
(8,'Synøve','Bakketun','Vassøyveien 7','3840','1990-10-15','K','Kundebehandler',647600.00),
(11,'Oliver','Abrahamsen','Tarjei Vesaas vei 3A','3041','1994-06-20','M','Lagermedarbeider',583600.00),
(13,'Oda','Cappelen','Norheimskneiken 12','3800','1996-07-28','K','Produktutvikler',816400.00),
(17,'Karl Anton','Hoff','Furustia 3','3840','2003-01-03','M','Kundebehandler',590400.00);

INSERT INTO Kunde VALUES
(5002,'Paal','Aass','Lindemans gate 79','1701'),
(5007,'Joakim','Laursen','Thomas Heftyes gate 39','0150'),
(5039,'Katrine','Eilertsen','Ingar Nilsens vei 12C','7003'),
(5042,'Skjalg','Tengesdal','Nobels gate 17','5000'),
(5079,'Ine','Kraft','Thomles gate 8','3041'),
(5119,'Thale','Evenrud','Kirkeveien 5','0250'),
(5172,'Aasta','Garvik','Kyrre Grepps gate 19','1300'),
(5188,'Jorid','Marcussen','Haarklous plass 23C','9013'),
(5201,'Reidar','Sørli','Pilestredet 22','0150'),
(5215,'Ada','Brynhildsen','Brugata 5','2200');

INSERT INTO Ordre VALUES
(101,'2024-09-01','2024-09-02','2024-09-15',5002),
(102,'2024-09-03','2024-09-05',NULL,5007),
(103,'2024-09-04','2024-09-04','2024-09-20',5039),
(104,'2024-09-08',NULL,NULL,5042),
(105,'2024-09-10','2024-09-12','2024-09-25',5002),
(106,'2024-09-15','2024-09-17','2024-09-28',5079),
(107,'2024-10-01','2024-10-03',NULL,5119),
(108,'2024-10-05',NULL,NULL,5172),
(109,'2024-10-10','2024-10-11','2024-10-30',5007),
(110,'2024-10-15','2024-10-15','2024-10-25',5188);

INSERT INTO Ordrelinje VALUES
(101,'22054',101.50,2),
(101,'33044',20.50,5),
(102,'10820',66.50,3),
(102,'25079',480.00,1),
(103,'77249',2240.00,1),
(103,'77251',946.00,1),
(103,'77277',515.00,2),
(104,'42929',119.00,4),
(104,'44939',165.00,2),
(105,'55129',221.00,3),
(105,'55130',429.50,1),
(106,'65060',66.50,2),
(106,'65070',170.50,1),
(107,'80088',306.00,2),
(108,'90510',619.50,1),
(108,'25131',1550.00,1),
(109,'33045',25.50,10),
(109,'41096',165.00,2),
(110,'10830',83.50,4),
(110,'22165',7763.00,1);
`;

const HOBBYHUS_REF: TableSchema[] = [
  {
    name: "Poststed",
    columns: [
      { name: "PostNr", type: "TEXT PK" },
      { name: "Poststed", type: "TEXT" },
    ],
  },
  {
    name: "Kategori",
    columns: [
      { name: "KatNr", type: "INTEGER PK" },
      { name: "Navn", type: "TEXT" },
    ],
  },
  {
    name: "Vare",
    columns: [
      { name: "VNr", type: "TEXT PK" },
      { name: "Betegnelse", type: "TEXT" },
      { name: "Pris", type: "NUMERIC" },
      { name: "KatNr", type: "INTEGER FK" },
      { name: "Antall", type: "INTEGER" },
      { name: "Hylle", type: "TEXT" },
    ],
  },
  {
    name: "Ansatt",
    columns: [
      { name: "AnsNr", type: "INTEGER PK" },
      { name: "Fornavn", type: "TEXT" },
      { name: "Etternavn", type: "TEXT" },
      { name: "Adresse", type: "TEXT" },
      { name: "PostNr", type: "TEXT FK" },
      { name: "Fodselsdato", type: "DATE" },
      { name: "Kjonn", type: "TEXT" },
      { name: "Stilling", type: "TEXT" },
      { name: "Aarslonn", type: "NUMERIC" },
    ],
  },
  {
    name: "Kunde",
    columns: [
      { name: "KNr", type: "INTEGER PK" },
      { name: "Fornavn", type: "TEXT" },
      { name: "Etternavn", type: "TEXT" },
      { name: "Adresse", type: "TEXT" },
      { name: "PostNr", type: "TEXT FK" },
    ],
  },
  {
    name: "Ordre",
    columns: [
      { name: "OrdreNr", type: "INTEGER PK" },
      { name: "OrdreDato", type: "DATE" },
      { name: "SendtDato", type: "DATE" },
      { name: "BetaltDato", type: "DATE" },
      { name: "KNr", type: "INTEGER FK" },
    ],
  },
  {
    name: "Ordrelinje",
    columns: [
      { name: "OrdreNr", type: "INTEGER FK" },
      { name: "VNr", type: "TEXT FK" },
      { name: "PrisPrEnhet", type: "NUMERIC" },
      { name: "Antall", type: "INTEGER" },
    ],
  },
];

// ---------- BIBLIOTEK (kapittel 4 — Boklån) ----------
const BIBLIOTEK_SCHEMA = `
CREATE TABLE Bok (
  ISBN TEXT PRIMARY KEY,
  Tittel TEXT,
  Forfatter TEXT,
  Forlag TEXT,
  UtgittAar INTEGER,
  AntallSider INTEGER
);
CREATE TABLE Eksemplar (
  ISBN TEXT,
  EksNr INTEGER,
  PRIMARY KEY (ISBN, EksNr),
  FOREIGN KEY (ISBN) REFERENCES Bok(ISBN)
);
CREATE TABLE Laaner (
  LNr INTEGER PRIMARY KEY,
  Fornavn TEXT,
  Etternavn TEXT,
  Adresse TEXT
);
CREATE TABLE Utlaan (
  UtlaansNr INTEGER PRIMARY KEY,
  LNr INTEGER,
  ISBN TEXT,
  EksNr INTEGER,
  Utlaansdato DATE,
  Levert TEXT,
  FOREIGN KEY (LNr) REFERENCES Laaner(LNr),
  FOREIGN KEY (ISBN, EksNr) REFERENCES Eksemplar(ISBN, EksNr)
);
`;

const BIBLIOTEK_SEED = `
INSERT INTO Bok VALUES
('8203188443','Kristin Lavransdatter: kransen','Undset, Sigrid','Aschehoug',1920,323),
('8203209394','Fyret: en ny sak for Dalgliesh','James, P. D.','Aschehoug',2005,413),
('8205312443','Lasso rundt fru Luna','Mykle, Agnar','Gyldendal',1954,614),
('8205336148','Victoria','Hamsun, Knut','Gyldendal',1898,111),
('8253025033','Jonas','Bjørneboe, Jens','Pax',1955,302),
('8278442231','Den gamle mannen og havet','Hemingway, Ernest','Gyldendal',1952,99);

INSERT INTO Eksemplar VALUES
('8203188443',1),('8203188443',2),
('8203209394',1),('8203209394',2),('8203209394',3),
('8205312443',1),
('8205336148',1),('8205336148',2),
('8253025033',1),('8253025033',2),
('8278442231',1);

INSERT INTO Laaner VALUES
(1,'Lise','Jensen','Erling Skjalgssons gate 56'),
(2,'Joakim','Gjertsen','Grinda 2'),
(3,'Katrine','Garvik','Ottar Birtings gate 9'),
(4,'Emilie','Marcussen','Kyrre Grepps gate 19'),
(5,'Valter','Eilertsen','Fyrstikkbakken 5D'),
(6,'Tormod','Vaksdal','Lassons gate 32'),
(7,'Asle','Eckhoff','Kirkeveien 5'),
(8,'Birthe','Aass','Henrik Wergelands Allé 47');

INSERT INTO Utlaan VALUES
(1,2,'8203209394',1,'2024-08-25','0'),
(2,2,'8253025033',2,'2024-08-25','1'),
(3,3,'8203188443',1,'2024-08-25','0'),
(4,4,'8278442231',1,'2024-08-25','0'),
(5,2,'8205336148',2,'2024-08-27','0'),
(6,8,'8203209394',2,'2024-08-27','0'),
(7,7,'8205312443',1,'2024-08-27','1');
`;

const BIBLIOTEK_REF: TableSchema[] = [
  {
    name: "Bok",
    columns: [
      { name: "ISBN", type: "TEXT PK" },
      { name: "Tittel", type: "TEXT" },
      { name: "Forfatter", type: "TEXT" },
      { name: "Forlag", type: "TEXT" },
      { name: "UtgittAar", type: "INTEGER" },
      { name: "AntallSider", type: "INTEGER" },
    ],
  },
  {
    name: "Eksemplar",
    columns: [
      { name: "ISBN", type: "TEXT FK" },
      { name: "EksNr", type: "INTEGER PK" },
    ],
  },
  {
    name: "Laaner",
    columns: [
      { name: "LNr", type: "INTEGER PK" },
      { name: "Fornavn", type: "TEXT" },
      { name: "Etternavn", type: "TEXT" },
      { name: "Adresse", type: "TEXT" },
    ],
  },
  {
    name: "Utlaan",
    columns: [
      { name: "UtlaansNr", type: "INTEGER PK" },
      { name: "LNr", type: "INTEGER FK" },
      { name: "ISBN", type: "TEXT FK" },
      { name: "EksNr", type: "INTEGER FK" },
      { name: "Utlaansdato", type: "DATE" },
      { name: "Levert", type: "TEXT" },
    ],
  },
];

// ---------- LAND (kapittel 4 — Innbyggere) ----------
const LAND_SCHEMA = `
CREATE TABLE Land (
  LandId INTEGER PRIMARY KEY,
  Navn TEXT,
  Flateinnhold INTEGER,
  Hovedstad INTEGER
);
CREATE TABLE Byer (
  ById INTEGER PRIMARY KEY,
  Navn TEXT,
  Flateinnhold INTEGER,
  LandId INTEGER,
  FOREIGN KEY (LandId) REFERENCES Land(LandId)
);
CREATE TABLE Innbyggertall (
  LandId INTEGER,
  Aarstall INTEGER,
  Antall INTEGER,
  PRIMARY KEY (LandId, Aarstall),
  FOREIGN KEY (LandId) REFERENCES Land(LandId)
);
CREATE TABLE Grense (
  LandId1 INTEGER,
  LandId2 INTEGER,
  PRIMARY KEY (LandId1, LandId2),
  FOREIGN KEY (LandId1) REFERENCES Land(LandId),
  FOREIGN KEY (LandId2) REFERENCES Land(LandId)
);
`;

const LAND_SEED = `
INSERT INTO Land VALUES
(1,'Norge',323787,1),
(2,'Sverige',450295,2),
(3,'Finland',338455,3),
(4,'Danmark',43094,4),
(5,'Tyskland',357022,5),
(6,'Frankrike',551695,6),
(7,'Polen',312696,7),
(8,'Nederland',41543,8),
(9,'Belgia',30528,9),
(10,'Russland',17098242,10);

INSERT INTO Byer VALUES
(1,'Oslo',454,1),(2,'Stockholm',188,2),(3,'Helsinki',214,3),
(4,'København',86,4),(5,'Berlin',891,5),(6,'Paris',105,6),
(7,'Warszawa',517,7),(8,'Amsterdam',219,8),(9,'Brussel',161,9),
(10,'Moskva',2511,10),
(11,'Bergen',464,1),(12,'Trondheim',342,1),
(13,'Göteborg',450,2),(14,'München',310,5),(15,'Marseille',241,6);

INSERT INTO Innbyggertall VALUES
(1,2015,5210000),(1,2018,5328000),(1,2020,5391000),(1,2022,5475000),(1,2024,5550000),
(2,2015,9851000),(2,2018,10120000),(2,2020,10353000),(2,2022,10491000),(2,2024,10551000),
(3,2015,5479000),(3,2018,5518000),(3,2020,5531000),(3,2022,5563000),(3,2024,5604000),
(4,2015,5660000),(4,2018,5781000),(4,2020,5831000),(4,2022,5873000),(4,2024,5946000),
(5,2015,81687000),(5,2018,83019000),(5,2020,83240000),(5,2022,84358000),(5,2024,84669000),
(6,2015,66415000),(6,2018,66988000),(6,2020,67392000),(6,2022,67970000),(6,2024,68374000),
(7,2015,38005000),(7,2018,37974000),(7,2020,37846000),(7,2022,37654000),(7,2024,36621000),
(8,2015,16900000),(8,2018,17231000),(8,2020,17441000),(8,2022,17590000),(8,2024,17942000),
(9,2015,11237000),(9,2018,11427000),(9,2020,11493000),(9,2022,11631000),(9,2024,11748000),
(10,2015,146267000),(10,2018,146781000),(10,2020,146749000),(10,2022,144713000),(10,2024,143883000);

INSERT INTO Grense VALUES
(1,2),(2,1),(1,3),(3,1),(2,3),(3,2),
(4,5),(5,4),
(5,6),(6,5),(5,7),(7,5),(5,8),(8,5),(5,9),(9,5),
(6,8),(8,6),(6,9),(9,6),
(8,9),(9,8),
(7,10),(10,7);
`;

const LAND_REF: TableSchema[] = [
  {
    name: "Land",
    columns: [
      { name: "LandId", type: "INTEGER PK" },
      { name: "Navn", type: "TEXT" },
      { name: "Flateinnhold", type: "INTEGER" },
      { name: "Hovedstad", type: "INTEGER FK" },
    ],
  },
  {
    name: "Byer",
    columns: [
      { name: "ById", type: "INTEGER PK" },
      { name: "Navn", type: "TEXT" },
      { name: "Flateinnhold", type: "INTEGER" },
      { name: "LandId", type: "INTEGER FK" },
    ],
  },
  {
    name: "Innbyggertall",
    columns: [
      { name: "LandId", type: "INTEGER FK" },
      { name: "Aarstall", type: "INTEGER" },
      { name: "Antall", type: "INTEGER" },
    ],
  },
  {
    name: "Grense",
    columns: [
      { name: "LandId1", type: "INTEGER FK" },
      { name: "LandId2", type: "INTEGER FK" },
    ],
  },
];

// ---------- SYKKELUTLEIE (kapittel 3) ----------
const SYKKELUTLEIE_SCHEMA = `
CREATE TABLE Kunde (
  KNr INTEGER PRIMARY KEY,
  Fornavn TEXT NOT NULL,
  Etternavn TEXT NOT NULL,
  Mobil TEXT UNIQUE
);
CREATE TABLE Modell (
  MNr INTEGER PRIMARY KEY,
  Fabrikk TEXT,
  Betegnelse TEXT,
  Kategori TEXT,
  Dagpris NUMERIC
);
CREATE TABLE Sykkel (
  MNr INTEGER,
  KopiNr INTEGER,
  Ramme INTEGER,
  Farge TEXT,
  PRIMARY KEY (MNr, KopiNr),
  FOREIGN KEY (MNr) REFERENCES Modell(MNr)
);
CREATE TABLE Utleie (
  KNr INTEGER,
  MNr INTEGER NOT NULL,
  KopiNr INTEGER NOT NULL,
  TidUt DATE NOT NULL,
  TidInn DATE,
  PRIMARY KEY (MNr, KopiNr, TidUt),
  FOREIGN KEY (KNr) REFERENCES Kunde(KNr),
  FOREIGN KEY (MNr, KopiNr) REFERENCES Sykkel(MNr, KopiNr)
);
`;

const SYKKELUTLEIE_SEED = `
INSERT INTO Kunde VALUES
(1,'Varg','Virrum','99887766'),
(2,'Trude','Stein','44556677'),
(4,'Katinka','Fosheim','45671234'),
(5,'Robert','Romman','98765432'),
(6,'Jon','Vein','81726354'),
(7,'Mona','Bø','40506070'),
(8,'Erik','Lund','41506070');

INSERT INTO Modell VALUES
(1,'Avante','Birken classic','Terreng',75.00),
(2,'Trailo','Askeladden','Hybrid',55.00),
(3,'Perimeter','Downtown','Bysykkel',120.00),
(4,'Avante','Dovregubben','Terreng',105.00),
(5,'Avante','Atlantis','Landevei',90.00),
(6,'Perimeter','Medita','Terreng',95.00),
(7,'Avante','Aeroflyt','Landevei',115.00),
(8,'Trailo','MultiX','Hybrid',150.00),
(9,'Trailo','Trailfinder','Terreng',140.00),
(10,'Perimeter','Vasaknekk','Terreng',50.00),
(11,'Avante','Olebrum','Hybrid',125.00),
(12,'Trailo','Alfavei','Terreng',80.00);

INSERT INTO Sykkel VALUES
(1,1,25,'grå'),(1,2,28,'rød'),
(2,1,25,'blå'),(2,2,27,'svart'),(2,3,27,'grå'),
(3,1,28,'rød'),(3,2,28,'blå'),
(4,1,25,'svart'),
(5,1,25,'blå'),(5,2,28,'rød'),(5,3,28,'grå'),(5,4,28,'svart'),
(6,1,28,'blå'),
(7,1,25,'rød'),(7,2,25,'grå'),(7,3,27,'blå'),
(8,1,27,'rød'),(8,2,27,'blå'),(8,3,27,'grå'),
(9,1,28,'rød'),(9,2,28,'rød'),
(10,1,28,'rød'),(10,2,25,'svart'),(10,3,25,'blå'),
(11,1,27,'grå'),
(12,1,27,'rød'),(12,2,25,'svart'),(12,3,28,'blå');

INSERT INTO Utleie VALUES
(1,1,1,'2018-08-13','2018-08-15'),
(5,1,1,'2018-08-14',NULL),
(2,1,2,'2018-08-13','2018-08-14'),
(1,2,1,'2018-08-13','2018-08-14'),
(4,3,1,'2018-08-13',NULL),
(6,8,1,'2018-08-14',NULL),
(4,12,1,'2018-08-14',NULL),
(5,12,2,'2018-08-14','2018-08-14');
`;

const SYKKELUTLEIE_REF: TableSchema[] = [
  {
    name: "Kunde",
    columns: [
      { name: "KNr", type: "INTEGER PK" },
      { name: "Fornavn", type: "TEXT" },
      { name: "Etternavn", type: "TEXT" },
      { name: "Mobil", type: "TEXT" },
    ],
  },
  {
    name: "Modell",
    columns: [
      { name: "MNr", type: "INTEGER PK" },
      { name: "Fabrikk", type: "TEXT" },
      { name: "Betegnelse", type: "TEXT" },
      { name: "Kategori", type: "TEXT" },
      { name: "Dagpris", type: "NUMERIC" },
    ],
  },
  {
    name: "Sykkel",
    columns: [
      { name: "MNr", type: "INTEGER FK" },
      { name: "KopiNr", type: "INTEGER PK" },
      { name: "Ramme", type: "INTEGER" },
      { name: "Farge", type: "TEXT" },
    ],
  },
  {
    name: "Utleie",
    columns: [
      { name: "KNr", type: "INTEGER FK" },
      { name: "MNr", type: "INTEGER FK" },
      { name: "KopiNr", type: "INTEGER FK" },
      { name: "TidUt", type: "DATE" },
      { name: "TidInn", type: "DATE" },
    ],
  },
];

// ---------- FORSIKRING (kapittel 3) ----------
const FORSIKRING_SCHEMA = `
CREATE TABLE Kunde (
  KundeNr INTEGER PRIMARY KEY,
  FDato DATE,
  Fornavn TEXT,
  Etternavn TEXT
);
CREATE TABLE Forsikring (
  ForsNr INTEGER PRIMARY KEY,
  KundeNr INTEGER NOT NULL,
  RegNr TEXT UNIQUE NOT NULL,
  RegAar INTEGER NOT NULL,
  KmPrAar INTEGER NOT NULL,
  ForsType TEXT NOT NULL,
  Bonus INTEGER,
  AarsPremie NUMERIC,
  FOREIGN KEY (KundeNr) REFERENCES Kunde(KundeNr)
);
CREATE TABLE Skadesak (
  SaksNr INTEGER PRIMARY KEY,
  ForsNr INTEGER NOT NULL,
  RegDato DATE,
  SkadeType TEXT,
  FOREIGN KEY (ForsNr) REFERENCES Forsikring(ForsNr)
);
`;

const FORSIKRING_SEED = `
INSERT INTO Kunde VALUES
(1,'1992-07-17','Ola','Hansen'),
(2,'1995-11-04','Kari','Mo'),
(3,'1974-02-28','Anette','Lien'),
(4,'1988-05-12','Geir','Bakke'),
(5,'2001-09-23','Mari','Lund');

INSERT INTO Forsikring VALUES
(1,1,'LY12345',2016,22000,'Kasko',50,4500.00),
(2,1,'AD33445',2001,11000,'Ansvar',70,2300.00),
(3,2,'KZ99887',2014,18000,'Kasko',20,7800.00),
(4,3,'PN29298',2014,25000,'Delkasko',50,5200.00),
(5,3,'BC77001',2020,15000,'Kasko',60,5800.00),
(6,4,'EF11223',2018,30000,'Ansvar',40,3100.00),
(7,5,'GH99887',2022,12000,'Kasko',10,9200.00);

INSERT INTO Skadesak VALUES
(1,1,'2018-02-10','Kollisjon'),
(2,2,'2018-12-16','Brannskade'),
(3,2,'2019-07-30','Kollisjon'),
(4,2,'2019-10-01','Tyveri'),
(5,3,'2019-10-30','Glassrute'),
(6,5,'2021-04-15','Kollisjon'),
(7,6,'2022-08-22','Tyveri'),
(8,7,'2023-01-10','Glassrute'),
(9,7,'2023-09-05','Kollisjon');
`;

const FORSIKRING_REF: TableSchema[] = [
  {
    name: "Kunde",
    columns: [
      { name: "KundeNr", type: "INTEGER PK" },
      { name: "FDato", type: "DATE" },
      { name: "Fornavn", type: "TEXT" },
      { name: "Etternavn", type: "TEXT" },
    ],
  },
  {
    name: "Forsikring",
    columns: [
      { name: "ForsNr", type: "INTEGER PK" },
      { name: "KundeNr", type: "INTEGER FK" },
      { name: "RegNr", type: "TEXT" },
      { name: "RegAar", type: "INTEGER" },
      { name: "KmPrAar", type: "INTEGER" },
      { name: "ForsType", type: "TEXT" },
      { name: "Bonus", type: "INTEGER" },
      { name: "AarsPremie", type: "NUMERIC" },
    ],
  },
  {
    name: "Skadesak",
    columns: [
      { name: "SaksNr", type: "INTEGER PK" },
      { name: "ForsNr", type: "INTEGER FK" },
      { name: "RegDato", type: "DATE" },
      { name: "SkadeType", type: "TEXT" },
    ],
  },
];

// ---------- FLYPLASS (kapittel 4) ----------
const FLYPLASS_SCHEMA = `
CREATE TABLE Flyplass (
  Nr INTEGER PRIMARY KEY,
  Navn TEXT,
  Bynavn TEXT
);
CREATE TABLE Flyselskap (
  Kode TEXT PRIMARY KEY,
  Navn TEXT
);
CREATE TABLE Flyavgang (
  SelskapKode TEXT,
  LopeNr INTEGER,
  AvgPlass INTEGER,
  AvgKl TEXT,
  AnkPlass INTEGER,
  AnkKl TEXT,
  PRIMARY KEY (SelskapKode, LopeNr),
  FOREIGN KEY (SelskapKode) REFERENCES Flyselskap(Kode),
  FOREIGN KEY (AvgPlass) REFERENCES Flyplass(Nr),
  FOREIGN KEY (AnkPlass) REFERENCES Flyplass(Nr)
);
`;

const FLYPLASS_SEED = `
INSERT INTO Flyplass VALUES
(1,'Gardermoen','Oslo'),
(2,'Heathrow','London'),
(3,'Charles de Gaulle','Paris'),
(4,'Frankfurt','Frankfurt'),
(5,'Schiphol','Amsterdam'),
(6,'Kastrup','København'),
(7,'Arlanda','Stockholm'),
(8,'Flesland','Bergen'),
(57,'JFK','New York');

INSERT INTO Flyselskap VALUES
('LH','Lufthansa'),
('DY','Norwegian'),
('SK','SAS'),
('BA','British Airways'),
('AF','Air France'),
('KL','KLM'),
('UA','United');

INSERT INTO Flyavgang VALUES
('DY',510,3,'16:30',1,'18:15'),
('SK',890,1,'10:30',2,'12:05'),
('SK',835,1,'08:25',3,'10:50'),
('LH',410,1,'09:00',4,'11:20'),
('KL',1186,1,'07:15',5,'09:30'),
('SK',455,1,'06:45',6,'08:10'),
('DY',744,1,'13:30',7,'14:35'),
('DY',310,1,'06:00',8,'06:55'),
('BA',765,1,'14:00',2,'15:35'),
('AF',1175,1,'15:00',3,'17:25'),
('SK',905,3,'13:15',5,'15:00'),
('LH',1003,4,'12:30',3,'14:00'),
('AF',1681,3,'09:45',1,'13:50'),
('UA',987,57,'09:00',2,'21:00'),
('UA',988,57,'10:30',3,'22:30'),
('BA',179,57,'18:00',2,'06:30'),
('DY',7015,57,'17:00',1,'07:30');
`;

const FLYPLASS_REF: TableSchema[] = [
  {
    name: "Flyplass",
    columns: [
      { name: "Nr", type: "INTEGER PK" },
      { name: "Navn", type: "TEXT" },
      { name: "Bynavn", type: "TEXT" },
    ],
  },
  {
    name: "Flyselskap",
    columns: [
      { name: "Kode", type: "TEXT PK" },
      { name: "Navn", type: "TEXT" },
    ],
  },
  {
    name: "Flyavgang",
    columns: [
      { name: "SelskapKode", type: "TEXT FK" },
      { name: "LopeNr", type: "INTEGER PK" },
      { name: "AvgPlass", type: "INTEGER FK" },
      { name: "AvgKl", type: "TEXT" },
      { name: "AnkPlass", type: "INTEGER FK" },
      { name: "AnkKl", type: "TEXT" },
    ],
  },
];

// ---------- BILSALG (kap. 3 — DDL/DML-øvelser) ----------
const BILSALG_SCHEMA = `
CREATE TABLE Kommune (
  KommuneNr TEXT PRIMARY KEY,
  Kommunenavn TEXT NOT NULL
);
CREATE TABLE Bilmodell (
  Bilmerke TEXT,
  Bilmodell TEXT,
  Gruppe TEXT NOT NULL CHECK (Gruppe IN ('personbil','varebil','lastebil','buss')),
  AntallHK INTEGER NOT NULL CHECK (AntallHK > 0 AND AntallHK < 300),
  PRIMARY KEY (Bilmerke, Bilmodell)
);
CREATE TABLE Bilsalg (
  Bilmerke TEXT,
  Bilmodell TEXT,
  KommuneNr TEXT,
  Aar INTEGER CHECK (Aar BETWEEN 1980 AND 2100),
  Maaned INTEGER CHECK (Maaned BETWEEN 1 AND 12),
  Antall INTEGER NOT NULL,
  PRIMARY KEY (Bilmerke, Bilmodell, KommuneNr, Aar, Maaned),
  FOREIGN KEY (Bilmerke, Bilmodell) REFERENCES Bilmodell(Bilmerke, Bilmodell),
  FOREIGN KEY (KommuneNr) REFERENCES Kommune(KommuneNr)
);
`;

const BILSALG_SEED = `
INSERT INTO Kommune VALUES
('0301','Oslo'),('1103','Stavanger'),('4601','Bergen'),
('5001','Trondheim'),('1804','Bodø'),('5401','Tromsø'),('3403','Hamar');

INSERT INTO Bilmodell VALUES
('Toyota','Avensis','personbil',130),
('Toyota','Yaris','personbil',92),
('Volvo','XC60','personbil',190),
('Ford','Transit','varebil',170),
('Volvo','FH16','lastebil',290),
('Scania','124','lastebil',270),
('Mercedes-Benz','Citaro','buss',280);

INSERT INTO Bilsalg VALUES
('Toyota','Avensis','0301',2024,1,12),
('Toyota','Avensis','0301',2024,2,18),
('Toyota','Yaris','0301',2024,1,25),
('Toyota','Yaris','4601',2024,1,8),
('Volvo','XC60','0301',2024,3,15),
('Volvo','XC60','5001',2024,3,7),
('Ford','Transit','1103',2024,2,5),
('Volvo','FH16','5001',2024,1,2),
('Scania','124','1103',2024,2,3),
('Mercedes-Benz','Citaro','0301',2024,4,1);
`;

const BILSALG_REF: TableSchema[] = [
  {
    name: "Kommune",
    columns: [
      { name: "KommuneNr", type: "TEXT PK" },
      { name: "Kommunenavn", type: "TEXT" },
    ],
  },
  {
    name: "Bilmodell",
    columns: [
      { name: "Bilmerke", type: "TEXT PK" },
      { name: "Bilmodell", type: "TEXT PK" },
      { name: "Gruppe", type: "TEXT" },
      { name: "AntallHK", type: "INTEGER" },
    ],
  },
  {
    name: "Bilsalg",
    columns: [
      { name: "Bilmerke", type: "TEXT FK" },
      { name: "Bilmodell", type: "TEXT FK" },
      { name: "KommuneNr", type: "TEXT FK" },
      { name: "Aar", type: "INTEGER" },
      { name: "Maaned", type: "INTEGER" },
      { name: "Antall", type: "INTEGER" },
    ],
  },
];

// ---------- BLANK (tom database for CREATE TABLE-oppgaver) ----------
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
  film: {
    id: "film",
    name: "Film (DTE-2509 eksamen)",
    description: "Filmtabellen fra DTE-2509 — øv på eksamenstypiske spørringer.",
    schemaSql: FILM_SCHEMA,
    seedSql: FILM_SEED,
    reference: FILM_REF,
  },
  employee: {
    id: "employee",
    name: "EmployeeDB (Oblig 1)",
    description: "Klassisk emp/dept-skjema fra Oblig 1 — ansatte og avdelinger.",
    schemaSql: EMPLOYEE_SCHEMA,
    seedSql: EMPLOYEE_SEED,
    reference: EMPLOYEE_REF,
  },
  reise: {
    id: "reise",
    name: "Reisebyrå (DAT1000 V2025)",
    description: "Kunde, Destinasjon, Reise og Bestilling — basert på DAT1000 vår 2025-eksamen.",
    schemaSql: REISE_SCHEMA,
    seedSql: REISE_SEED,
    reference: REISE_REF,
  },
  renhold: {
    id: "renhold",
    name: "Renholdsbyrå (DAT1000 H2024)",
    description: "Kunde, Bolig, Avtaletype og Avtale — basert på DAT1000 høst 2024-eksamen.",
    schemaSql: RENHOLD_SCHEMA,
    seedSql: RENHOLD_SEED,
    reference: RENHOLD_REF,
  },
  hobbyhus: {
    id: "hobbyhus",
    name: "Hobbyhuset (kap. 4)",
    description:
      "Vare, Kategori, Ordre, Ordrelinje, Kunde, Ansatt, Poststed — nettbutikk fra læreboka (redusert datasett).",
    schemaSql: HOBBYHUS_SCHEMA,
    seedSql: HOBBYHUS_SEED,
    reference: HOBBYHUS_REF,
  },
  bibliotek: {
    id: "bibliotek",
    name: "Bibliotek (kap. 4 — Boklån)",
    description: "Bok, Eksemplar, Låner og Utlån — bokutlånssystem.",
    schemaSql: BIBLIOTEK_SCHEMA,
    seedSql: BIBLIOTEK_SEED,
    reference: BIBLIOTEK_REF,
  },
  land: {
    id: "land",
    name: "Land (kap. 4 — Innbyggere)",
    description: "Land, Byer, Innbyggertall og Grense — geografi og demografi.",
    schemaSql: LAND_SCHEMA,
    seedSql: LAND_SEED,
    reference: LAND_REF,
  },
  sykkelutleie: {
    id: "sykkelutleie",
    name: "Sykkelutleie (kap. 3)",
    description: "Kunde, Modell, Sykkel og Utleie — sykkelutleiefirma.",
    schemaSql: SYKKELUTLEIE_SCHEMA,
    seedSql: SYKKELUTLEIE_SEED,
    reference: SYKKELUTLEIE_REF,
  },
  forsikring: {
    id: "forsikring",
    name: "Forsikring (kap. 3)",
    description: "Kunde, Forsikring og Skadesak — bilforsikring.",
    schemaSql: FORSIKRING_SCHEMA,
    seedSql: FORSIKRING_SEED,
    reference: FORSIKRING_REF,
  },
  flyplass: {
    id: "flyplass",
    name: "Flyplass (kap. 4)",
    description: "Flyplass, Flyselskap og Flyavgang — flytrafikk og ruter.",
    schemaSql: FLYPLASS_SCHEMA,
    seedSql: FLYPLASS_SEED,
    reference: FLYPLASS_REF,
  },
  bilsalg: {
    id: "bilsalg",
    name: "Bilsalg (kap. 3 — DDL/DML)",
    description: "Kommune, Bilmodell og Bilsalg — for INSERT/UPDATE/DELETE-øvelser fra kapittel 3.",
    schemaSql: BILSALG_SCHEMA,
    seedSql: BILSALG_SEED,
    reference: BILSALG_REF,
  },
  blank: {
    id: "blank",
    name: "Tom DB (CREATE TABLE-øvelser)",
    description:
      "Database uten tabeller — bruk CREATE TABLE selv. Beregnet for kapittel 3-oppgaver.",
    schemaSql: BLANK_SCHEMA,
    seedSql: BLANK_SEED,
    reference: BLANK_REF,
  },
};

export const DATASET_LIST: Dataset[] = [
  DATASETS.ecommerce,
  DATASETS.university,
  DATASETS.library,
  DATASETS.film,
  DATASETS.employee,
  DATASETS.reise,
  DATASETS.renhold,
  DATASETS.hobbyhus,
  DATASETS.bibliotek,
  DATASETS.land,
  DATASETS.sykkelutleie,
  DATASETS.forsikring,
  DATASETS.flyplass,
  DATASETS.bilsalg,
  DATASETS.blank,
];

export function getDataset(id: DatasetId): Dataset {
  return DATASETS[id] ?? DATASETS.ecommerce;
}
