import { FlaskLifecyclePage } from "@/components/stack/flask-livssyklus/FlaskLifecyclePage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-flask-livssyklus",
  slug: "flask-livssyklus",
  title: "Flask request-livssyklus",
  group: "eksamen",
  order: 5,
  status: "ready",
  shortDescription: "Fra HTTP-bytes til request.form til DB-spørring og tilbake.",
  prerequisites: [
    { slug: "bytes-encoding", title: "Bytes & encoding" },
    { slug: "tcp-sockets", title: "TCP & sockets (kort)" },
  ],
  Component: FlaskLifecyclePage,
};
