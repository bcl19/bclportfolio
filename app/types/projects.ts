import type { Project } from "@/app/types/types";

export const projects: Project[] = [
  {
    id: "mindtrack",
    title: "MindTrack",
    description:
      "Aplicação fullstack para análise e acompanhamento de emoções.",
    technologies: [
      "React",
      "Spring Boot",
      "PostgreSQL",
      "Tailwind CSS",
    ],
    github: "https://github.com/bcl19",
    demo: "https://...",
  },

  {
    id: "todo",
    title: "Todo App",
    description:
      "Aplicação para gerenciamento de tarefas.",
    technologies: [
      "React",
      "TypeScript",
      "Firebase",
    ],
  },
];