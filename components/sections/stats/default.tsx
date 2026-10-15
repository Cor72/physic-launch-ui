import { ImageUpIcon, PanelsTopLeftIcon, SparklesIcon } from "lucide-react";
import { ReactNode } from "react";

import { Section } from "../../ui/section";

interface StatItemProps {
  title: string;
  description: string;
  icon: ReactNode;
}

interface StatsProps {
  items?: StatItemProps[] | false;
  className?: string;
}

const DEFAULT_STATS: StatItemProps[] = [
  {
    title: "上传题目",
    description: "选择清晰、完整且不含无关个人信息的物理题图片。",
    icon: <ImageUpIcon className="size-5" />,
  },
  {
    title: "核对识别结果",
    description: "检查题意、物体和已知条件，避免模糊图片影响生成。",
    icon: <SparklesIcon className="size-5" />,
  },
  {
    title: "观察动态过程",
    description: "进入生成的画布，通过播放、暂停和调整继续探索。",
    icon: <PanelsTopLeftIcon className="size-5" />,
  },
];

export default function Stats({
  items = DEFAULT_STATS,
  className,
}: StatsProps) {
  return (
    <Section id="workflow" className={className}>
      <div className="container mx-auto flex max-w-[960px] flex-col gap-10">
        <div className="max-w-[640px]">
          <p className="text-brand mb-3 text-sm font-semibold">使用流程</p>
          <h2 className="text-3xl leading-tight font-semibold sm:text-5xl">
            三个动作，看见题目里的运动
          </h2>
        </div>
        {items !== false && items.length > 0 && (
          <div className="border-border grid overflow-hidden rounded-2xl border bg-card/50 md:grid-cols-3">
            {items.map((item, index) => (
              <div
                key={item.title}
                className="border-border relative flex flex-col gap-4 border-b p-6 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-brand/10 text-brand grid size-10 place-items-center rounded-full">
                    {item.icon}
                  </span>
                  <span className="text-muted-foreground text-xs font-semibold tabular-nums">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
