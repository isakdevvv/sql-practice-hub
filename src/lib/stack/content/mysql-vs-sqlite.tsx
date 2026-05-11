import { MysqlVsSqlitePage } from "@/components/stack/mysql-vs-sqlite/MysqlVsSqlitePage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-mysql-vs-sqlite",
  slug: "mysql-vs-sqlite",
  title: "MySQL vs SQLite — porting og pensum",
  group: "eksamen",
  order: 10,
  status: "ready",
  shortDescription:
    "Eksamen-pensum bruker MySQL (dte_2509). Plattformen kjører SQLite. Slik mapper du DDL og tilkobling mellom dem — pluss vanlige feller.",
  prerequisites: [],
  Component: MysqlVsSqlitePage,
};
