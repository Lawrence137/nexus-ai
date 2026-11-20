
import type { Conversation } from "@/types/chat";

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    title: "Understanding React Server Components",
    updatedAt: new Date(),
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Explain React Server Components.",
        createdAt: new Date(),
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "React Server Components allow components to render on the server without shipping their component JavaScript to the browser. They are particularly useful for data fetching and reducing client-side JavaScript.",
        createdAt: new Date(),
      },
    ],
  },
  {
    id: "2",
    title: "Building a REST API with Next.js",
    updatedAt: new Date(Date.now() - 86400000),
    messages: [],
  },
  {
    id: "3",
    title: "TypeScript design patterns",
    updatedAt: new Date(Date.now() - 172800000),
    messages: [],
  },
];
