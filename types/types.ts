export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github?: string;
  demo?: string;
  image?: string;
}
export interface Experience {
  id: string;
  company: string;
  role: string;
  description: string;
  period: string;
  technologies: string[];
}
export interface Skill {
  name: string;
  category: "frontend" | "backend" | "database" | "devops" | "other";
  level?: "basic" | "intermediate" | "advanced";
}