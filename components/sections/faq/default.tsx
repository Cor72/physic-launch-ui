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

const answerClassName = "text-muted-foreground mb-4 max-w-[680px] leading-relaxed";

export default function FAQ({
  title = "购买和使用前，你可能想了解",
  items = [
    {
      question: "星驰视界提供什么服务？",
      answer: (
        <p className={answerClassName}>
          星驰视界是一项在线数字服务。用户可以上传物理题目图片，使用题意识别、动态画布生成和交互观察等功能。生成结果用于辅助学习，不替代原题、教材、教师意见或用户自己的判断。
        </p>
      ),
    },
    {
      question: "积分包是会员或自动续费服务吗？",
      answer: (
        <p className={answerClassName}>
          不是。当前售卖的是一次性积分包，不按月或按年自动扣费。购买成功后积分进入购买账户，长期有效，不会过期。积分仅用于星驰视界内的数字内容与生成服务，不能兑换现金、转让或提现。
        </p>
      ),
    },
    {
      question: "购买积分后可以退款吗？",
      answer: (
        <p className={answerClassName}>
          数字服务具有即时交付和消耗的特点。付费积分一旦使用，除法律另有规定或平台原因导致服务无法提供外，原则上不支持无理由退款。付费积分完全未使用、重复扣款、支付后未到账等情况，可以联系客服核查处理。完整条件请查看
          <Link className="text-foreground underline" href={siteConfig.links.pointsPolicy}>
            《积分购买及退款规则》
          </Link>
          。
        </p>
      ),
    },
    {
      question: "积分如何扣除？",
      answer: (
        <p className={answerClassName}>
          不同数字服务可能使用不同积分数量。操作前请以对应功能页面展示的扣除数量为准，确认后再继续。账户中的余额和使用记录可用于核对积分变化。
        </p>
      ),
    },
    {
      question: "购买后如何申请发票？",
      answer: (
        <p className={answerClassName}>
          如需开具发票，请保留订单信息，并通过客服邮箱 {siteConfig.supportEmail} 或客服电话 {siteConfig.supportPhone} 联系我们办理。
        </p>
      ),
    },
    {
      question: "题目图片与个人信息会如何处理？",
      answer: (
        <p className={answerClassName}>
          平台仅在提供账户、题目处理、订单和安全保障等服务所需范围内处理信息。上传题目图片前，请遮盖姓名、学校、联系方式等与题目无关的个人信息。详细说明和用户权利见
          <Link className="text-foreground underline" href={siteConfig.links.privacy}>
            《隐私政策》
          </Link>
          。
        </p>
      ),
    },
    {
      question: "生成结果一定准确吗？",
      answer: (
        <p className={answerClassName}>
          题目清晰度、信息完整度和模型适配情况都会影响结果。请在生成前核对识别出的条件，并在使用过程中对照原题。若发现异常，可停止使用并通过客服渠道反馈。
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
