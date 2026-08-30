import {
  CameraIcon,
  FolderOpenIcon,
  LightbulbIcon,
  MoveUpRightIcon,
  PlayCircleIcon,
  PresentationIcon,
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
    title: "拍照识题",
    description: "上传图片或输入文字，提取物体、已知条件与待求内容。",
    icon: <CameraIcon className="size-5 stroke-1" />,
  },
  {
    title: "过程拆解",
    description: "把复杂情境拆成多个阶段，理清先后顺序与关键节点。",
    icon: <SplitIcon className="size-5 stroke-1" />,
  },
  {
    title: "动态演示",
    description: "播放、暂停与回看，在关键时刻停下来观察物体的运动。",
    icon: <PlayCircleIcon className="size-5 stroke-1" />,
  },
  {
    title: "物理量可视化",
    description: "同步观察速度、受力与轨迹，联系运动现象和物理规律。",
    icon: <MoveUpRightIcon className="size-5 stroke-1" />,
  },
  {
    title: "参数调节",
    description: "改变初速度、质量或摩擦系数，比较不同条件下的结果。",
    icon: <SlidersHorizontalIcon className="size-5 stroke-1" />,
  },
  {
    title: "教师讲授",
    description: "按阶段展开情境，在关键位置讲解，减少反复画图的负担。",
    icon: <PresentationIcon className="size-5 stroke-1" />,
  },
  {
    title: "分层启发",
    description: "先观察情境，再查看受力与提示，为学生保留独立思考空间。",
    icon: <LightbulbIcon className="size-5 stroke-1" />,
  },
  {
    title: "模型积累",
    description: "逐步扩充题型模型与学习记录，让每次探索都能回顾复用。",
    icon: <FolderOpenIcon className="size-5 stroke-1" />,
  },
];

export default function Items({
  title = "把解题过程，一步步看清楚",
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
            围绕题意理解、物理计算与交互探索逐步完善。以下为核心功能规划，当前可先观看题目与动态场景的示例演示。
          </p>
        </div>
        {items !== false && items.length > 0 && (
          <div className="grid auto-rows-fr grid-cols-2 gap-0 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
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
