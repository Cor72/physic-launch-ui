import {
  CameraIcon,
  CircleUserRoundIcon,
  MoveUpRightIcon,
  PlayCircleIcon,
  SlidersHorizontalIcon,
  SplitIcon,
} from "lucide-react";
import { ReactNode } from "react";

import { Item, ItemDescription, ItemIcon, ItemTitle } from "../../ui/item";
import { Section } from "../../ui/section";

interface ItemProps {
  title: string;
  description: string;
  icon: ReactNode;
}

interface ItemsProps {
  title?: string;
  items?: ItemProps[] | false;
  className?: string;
}

const DEFAULT_ITEMS: ItemProps[] = [
  {
    title: "题目图片输入",
    description: "上传清晰的物理题图片，开始识别题意与关键条件。",
    icon: <CameraIcon className="size-5 stroke-1" />,
  },
  {
    title: "题意与条件识别",
    description: "提取物体、已知量和运动阶段，生成前可以继续核对。",
    icon: <SplitIcon className="size-5 stroke-1" />,
  },
  {
    title: "动态画布生成",
    description: "将题目转化为可播放的物理场景，呈现关键运动过程。",
    icon: <PlayCircleIcon className="size-5 stroke-1" />,
  },
  {
    title: "运动过程观察",
    description: "播放、暂停与回看，对照题目观察受力、速度和轨迹。",
    icon: <MoveUpRightIcon className="size-5 stroke-1" />,
  },
  {
    title: "对象与参数调整",
    description: "在画布中调整对象和可用参数，继续验证自己的理解。",
    icon: <SlidersHorizontalIcon className="size-5 stroke-1" />,
  },
  {
    title: "积分与使用记录",
    description: "登录后查看积分余额和账户记录，清楚了解每次使用。",
    icon: <CircleUserRoundIcon className="size-5 stroke-1" />,
  },
];

export default function Items({
  title = "从题目图片，到可操作的动态画布",
  items = DEFAULT_ITEMS,
  className,
}: ItemsProps) {
  return (
    <Section id="features" className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-6 sm:gap-20">
        <div className="flex max-w-[640px] flex-col gap-4 text-center">
          <h2 className="text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight">
            {title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            星驰视界把题目识别、动态生成和交互观察放在同一条学习路径中。生成内容仅作学习辅助，请始终以原题条件和独立判断为准。
          </p>
        </div>
        {items !== false && items.length > 0 && (
          <div className="grid auto-rows-fr grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {items.map((item) => (
              <Item key={item.title}>
                <ItemTitle className="flex items-center gap-2">
                  <ItemIcon>{item.icon}</ItemIcon>
                  {item.title}
                </ItemTitle>
                <ItemDescription>{item.description}</ItemDescription>
              </Item>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
