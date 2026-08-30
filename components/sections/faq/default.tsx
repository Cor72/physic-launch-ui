import Link from "next/link";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Section } from "../../ui/section";

interface FAQItemProps {
  question: string;
  answer: ReactNode;
  value?: string;
}

interface FAQProps {
  title?: string;
  items?: FAQItemProps[] | false;
  className?: string;
}

export default function FAQ({
  title = "你可能还想了解",
  items = [
    {
      question: "现在可以上传题目，自动生成动画了吗？",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            当前页面是产品原型介绍，展示题目图片与预先准备的动态演示。拍照识题、题意确认、自动建模和参数调节正在规划开发中，尚未在本页面开放。
          </p>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            你可以先
            <Link
              href={siteConfig.getStartedUrl}
              className="text-foreground underline"
            >
              观看示例演示
            </Link>
            ，了解我们希望如何把文字题目转化为直观的物理过程。
          </p>
        </>
      ),
    },
    {
      question: "它和传统的拍照搜题有什么区别？",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            平台重点帮助你理解物体如何运动、为什么这样运动。围绕当前题目的条件建立场景，让运动阶段、受力方向和关键节点更容易观察。
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            后续将通过播放控制、参数调节和分层提示，让学生主动探索条件与结果的关系，再回到公式和推导中理解题目。
          </p>
        </>
      ),
    },
    {
      question: "第一阶段会优先支持哪些题型？",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            首期计划从平抛运动、斜面运动、圆周运动、弹簧模型和带电粒子运动五类高频题型开始，优先打磨可以完整展示运动过程的典型场景。
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            后续逐步增加滑块木板、传送带、碰撞与复合场等模型。超出模型支持范围的题目会明确提示，不追求第一版覆盖所有物理题。
          </p>
        </>
      ),
    },
    {
      question: "怎样减少题意识别或运动计算出错？",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            产品采用题意分析、标准物理模型、确定性计算与交互渲染分工的方案。人工智能负责理解语言和匹配模型，计算程序负责运动规律与阶段切换。
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            在生成场景前，计划先展示识别出的物体、参数与运动阶段，由用户确认。识别与模型都可能存在局限，使用时仍需结合原题核对条件，不能仅凭动画判断答案。
          </p>
        </>
      ),
    },
    {
      question: "老师可以怎样用它备课和讲授？",
      answer: (
        <p className="text-muted-foreground mb-4 max-w-[580px]">
          教师模式计划支持逐阶段演示、物理量显隐、关键位置暂停、自定义参数，以及课堂链接分享与动画导出。当前可以先通过首页示例，体验播放、暂停和回看运动过程。
        </p>
      ),
    },
    {
      question: "月度会员和年度会员怎么收费？",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            月度会员为 {siteConfig.pricing.monthly} 元/月，年度会员为{" "}
            {siteConfig.pricing.yearly} 元/年，折合每月{" "}
            {siteConfig.pricing.yearly / 12} 元。相比连续月付一年，年付可节省{" "}
            {siteConfig.pricing.monthly * 12 - siteConfig.pricing.yearly} 元。
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            当前页面仅展示会员方案，暂未开放购买。权益、使用额度与教师专属功能仍可调整，正式开放时会明确说明；基础示例演示可直接观看。
          </p>
        </>
      ),
    },
    {
      question: "会直接展示答案，让学生失去思考空间吗？",
      answer: (
        <p className="text-muted-foreground mb-4 max-w-[580px]">
          设计上会采用分层展示：先呈现情境，再观察运动过程，逐步查看受力、提示与解析。学生可以先预测，再操作验证，让动画成为理解与思考的辅助。
        </p>
      ),
    },
    {
      question: "题目图片与个人信息会如何处理？",
      answer: (
        <p className="text-muted-foreground mb-4 max-w-[580px]">
          当前演示页面不提供题目上传。正式开放识题功能前，会明确说明图片用途、保存方式与删除机制。准备题目图片时，建议遮盖姓名、学校、联系方式等与题目无关的信息。
        </p>
      ),
    },
  ],
  className,
}: FAQProps) {
  return (
    <Section id="faq" className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-8">
        <h2 className="text-center text-3xl font-semibold sm:text-5xl">
          {title}
        </h2>
        {items !== false && items.length > 0 && (
          <Accordion type="single" collapsible className="w-full max-w-[800px]">
            {items.map((item, index) => (
              <AccordionItem
                key={item.value ?? item.question}
                value={item.value || `item-${index + 1}`}
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </Section>
  );
}
