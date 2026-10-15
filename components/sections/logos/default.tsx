import {
  MagnetIcon,
  MoveUpRightIcon,
  OrbitIcon,
  TrendingDownIcon,
  WavesIcon,
} from "lucide-react";
import { ReactNode } from "react";

import { Badge } from "../../ui/badge";
import Logo from "../../ui/logo";
import { Section } from "../../ui/section";

interface LogosProps {
  title?: string;
  badge?: ReactNode | false;
  logos?: ReactNode[] | false;
  className?: string;
}

export default function Logos({
  title = "常见物理场景，都可以从运动过程开始理解",
  badge = (
    <Badge variant="outline" className="border-brand/30 text-brand">
      常见适用场景
    </Badge>
  ),
  logos = [
    <Logo key="projectile" image={MoveUpRightIcon} name="平抛运动" />,
    <Logo key="incline" image={TrendingDownIcon} name="斜面运动" />,
    <Logo key="circular" image={OrbitIcon} name="圆周运动" />,
    <Logo key="spring" image={WavesIcon} name="弹簧模型" />,
    <Logo key="particle" image={MagnetIcon} name="带电粒子" />,
  ],
  className,
}: LogosProps) {
  return (
    <Section id="models" className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-6">
          {badge !== false && badge}
          <h2 className="text-md font-semibold sm:text-2xl">{title}</h2>
        </div>
        {logos !== false && logos.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-8">
            {logos}
          </div>
        )}
      </div>
    </Section>
  );
}
