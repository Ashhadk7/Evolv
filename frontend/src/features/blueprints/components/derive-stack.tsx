import type { ReactNode } from "react";
import { Browser, CloudArrowUp, Cpu, Database, Stack } from "@phosphor-icons/react";
import type {
  StackCat,
  StackLayerKey,
  TechStackModel,
} from "@/features/blueprints/blueprint-content";

const STACK_CARDS: {
  key: StackLayerKey;
  name: string;
  icon: ReactNode;
}[] = [
  {
    key: "frontend",
    name: "Frontend",
    icon: <Browser size={18} weight="duotone" className="text-bp-teal" />,
  },
  {
    key: "backend",
    name: "Backend",
    icon: <Stack size={18} weight="duotone" className="text-bp-teal" />,
  },
  {
    key: "database",
    name: "Database",
    icon: <Database size={18} weight="duotone" className="text-bp-teal" />,
  },
  {
    key: "vectorDb",
    name: "Vector DB",
    icon: <Database size={18} weight="duotone" className="text-bp-teal" />,
  },
  {
    key: "aiProvider",
    name: "AI Provider",
    icon: <Cpu size={18} weight="duotone" className="text-bp-teal" />,
  },
  {
    key: "hosting",
    name: "Hosting",
    icon: <CloudArrowUp size={18} weight="duotone" className="text-bp-teal" />,
  },
];

export function deriveStack(techStack: TechStackModel): StackCat[] {
  return STACK_CARDS.map(({ key, name, icon }) => {
    const layer = techStack[key];
    const rows = [
      { k: "Chosen", v: layer.chosen },
      { k: "Why", v: layer.reasoning },
      { k: "Monthly cost", v: layer.monthlyCost },
    ].filter((row) => row.v);
    return {
      icon,
      name,
      primary: layer.chosen,
      rows,
    };
  });
}
