import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { CircularScene } from "../../physics/circular";
import { InclineScene } from "../../physics/incline";
import { MagneticScene } from "../../physics/magnetic";
import { ProjectileScene } from "../../physics/projectile";
import { ScenePlayer } from "../../physics/scene-player";
import { SpringScene } from "../../physics/spring";
import { InViewMotion } from "../../ui/in-view-motion";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeader,
  SectionLede,
  SectionTitle,
} from "../../ui/section";
import { Spotlight } from "../../ui/spotlight";

interface SceneProps {
  name: string;
  note: string;
  tags: string[];
  scene: ReactNode;
  wide?: boolean;
}

interface LogosProps {
  title?: string;
  eyebrow?: string;
  figure?: string;
  description?: string;
  scenes?: SceneProps[] | false;
  className?: string;
}

const DEFAULT_SCENES: SceneProps[] = [
  {
    name: "平抛运动",
    note: "水平方向匀速，竖直方向自由落体。等时间间隔的频闪位置，把两个分运动拆开给你看。",
    tags: ["运动的合成与分解", "频闪"],
    scene: <ProjectileScene className="h-full w-full" />,
    wide: true,
  },
  {
    name: "斜面运动",
    note: "重力沿斜面与垂直斜面分解，摩擦力方向随运动趋势判断。",
    tags: ["受力分析"],
    scene: <InclineScene className="h-full w-full" />,
  },
  {
    name: "圆周运动",
    note: "速度沿切线，加速度指向圆心，二者始终垂直。",
    tags: ["向心力"],
    scene: <CircularScene className="h-full w-full" />,
  },
  {
    name: "弹簧模型",
    note: "回复力与形变成正比、方向相反，位移随时间按余弦变化。",
    tags: ["简谐运动"],
    scene: <SpringScene className="h-full w-full" />,
  },
  {
    name: "带电粒子",
    note: "洛伦兹力始终垂直于速度，只改变方向不改变大小。",
    tags: ["电磁场"],
    scene: <MagneticScene className="h-full w-full" />,
  },
];

export default function Logos({
  title = "常见物理场景，都可以从运动过程开始理解",
  eyebrow = "适用场景",
  figure = "01",
  description = "以下示意均按真实物理关系绘制：频闪间隔、受力方向与运动周期彼此对应。",
  scenes = DEFAULT_SCENES,
  className,
}: LogosProps) {
  return (
    <Section id="models" className={className}>
      <Container className="flex flex-col gap-14">
        <div className="grid items-end gap-6 lg:grid-cols-[1.15fr_1fr]">
          <SectionHeader>
            <Eyebrow index={figure}>{eyebrow}</Eyebrow>
            <SectionTitle>{title}</SectionTitle>
          </SectionHeader>
          <SectionLede className="lg:justify-self-end lg:text-right">
            {description}
          </SectionLede>
        </div>

        {scenes !== false && scenes.length > 0 && (
          <InViewMotion className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scenes.map((scene, index) => (
              <Spotlight
                key={scene.name}
                className={cn(
                  "reveal border-line bg-surface-2 group flex flex-col overflow-hidden rounded-3xl border shadow-sm",
                  "hover:border-line-strong transition-[border-color,box-shadow] duration-300 hover:shadow-lg",
                  scene.wide && "md:col-span-2",
                )}
              >
                {/* The plate: a dotted canvas, like the product's own. */}
                <div
                  className={cn(
                    "grid-dots border-line-subtle relative border-b px-6 pt-8 pb-6",
                    scene.wide
                      ? "aspect-[16/8.4] md:aspect-auto md:h-80"
                      : "aspect-[16/10] md:aspect-auto md:h-80",
                  )}
                >
                  <div className="from-surface-2 pointer-events-none absolute inset-0 bg-linear-to-t to-transparent to-30% opacity-80" />
                  <ScenePlayer name={scene.name}>{scene.scene}</ScenePlayer>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="type-h3 text-ink">{scene.name}</h3>
                    <span className="type-label numeral text-ink-faint">
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {String(scenes.length).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="type-copy-sm text-ink-muted">{scene.note}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    {scene.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border-line text-ink-muted rounded-full border px-2.5 py-1 text-[0.75rem]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Spotlight>
            ))}
          </InViewMotion>
        )}
      </Container>
    </Section>
  );
}
