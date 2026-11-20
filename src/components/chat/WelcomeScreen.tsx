
import {
  Code2,
  Lightbulb,
  PenLine,
  Search,
  Sparkles,
} from "lucide-react";

type Props = {
  onPrompt: (prompt: string) => void;
};

const prompts = [
  {
    icon: Code2,
    title: "Write code",
    description: "Build a reusable React component",
    prompt: "Build a reusable React component with TypeScript.",
  },
  {
    icon: Lightbulb,
    title: "Learn something",
    description: "Explain a complex technical concept",
    prompt: "Explain how React Server Components work.",
  },
  {
    icon: PenLine,
    title: "Improve writing",
    description: "Make my technical writing clearer",
    prompt: "Help me write a professional technical project description.",
  },
  {
    icon: Search,
    title: "Explore an idea",
    description: "Think through a software architecture",
    prompt: "Help me design a scalable Next.js application.",
  },
];

export default function WelcomeScreen({ onPrompt }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-6 pt-16 text-center sm:pt-24">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
        <Sparkles size={26} className="text-violet-400" />
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        What can I help you with?
      </h1>

      <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-500">
        Ask questions, explore ideas, write code or solve
        problems with your preferred AI model.
      </p>

      <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {prompts.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              onClick={() => onPrompt(item.prompt)}
              className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-violet-500/40 hover:bg-white/[0.05]"
            >
              <div className="rounded-xl bg-white/5 p-3 text-zinc-400 group-hover:text-violet-400">
                <Icon size={19} />
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
