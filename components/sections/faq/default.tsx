import { MailIcon, MessageCircleQuestionIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeader,
  SectionTitle,
} from "../../ui/section";

interface FAQItemProps {
  question: string;
  answer: ReactNode;
  value?: string;
}

interface FAQProps {
  title?: string;
  eyebrow?: string;
  figure?: string;
  items?: FAQItemProps[] | false;
  className?: string;
}

const answerClassName = "type-copy text-ink-muted max-w-measure";

const inlineLinkClassName =
  "text-ink decoration-line-strong underline decoration-1 underline-offset-4 transition-colors hover:decoration-brand";

export default function FAQ({
  title = "购买和使用前，你可能想了解",
  eyebrow = "常见问题",
  figure = "05",
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
          <Link
            className={inlineLinkClassName}
            href={siteConfig.links.pointsPolicy}
          >
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
          如需开具发票，请保留订单信息，并通过客服邮箱 {siteConfig.supportEmail}{" "}
          或客服电话 {siteConfig.supportPhone} 联系我们办理。
        </p>
      ),
    },
    {
      question: "题目图片与个人信息会如何处理？",
      answer: (
        <p className={answerClassName}>
          平台仅在提供账户、题目处理、订单和安全保障等服务所需范围内处理信息。上传题目图片前，请遮盖姓名、学校、联系方式等与题目无关的个人信息。详细说明和用户权利见
          <Link className={inlineLinkClassName} href={siteConfig.links.privacy}>
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
      {/* Two columns on wide screens: the heading and support details hold
          a sticky left rail while the answers scroll past. */}
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,21rem)_1fr] lg:gap-20">
        <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
          <SectionHeader>
            <Eyebrow index={figure}>{eyebrow}</Eyebrow>
            {/* Narrow rail: step the display size down so the title breaks
                between words rather than mid-phrase. */}
            <SectionTitle className="type-h2 lg:max-w-[19rem]">
              {title}
            </SectionTitle>
          </SectionHeader>

          <div className="glass flex flex-col gap-4 rounded-3xl p-5">
            <div className="flex items-center gap-3">
              <span className="bg-brand-muted text-brand grid size-9 place-items-center rounded-full">
                <MessageCircleQuestionIcon className="size-4.5" />
              </span>
              <div className="flex flex-col">
                <span className="text-ink text-[0.9375rem] font-medium">没有找到答案？</span>
                <span className="text-ink-faint text-[0.8125rem]">客服会在核实信息后尽快回复</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="hover:bg-surface-3 text-ink-muted hover:text-ink -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 text-[0.875rem] transition-colors"
              >
                <MailIcon className="text-ink-faint size-4" />
                {siteConfig.supportEmail}
              </a>
              <a
                href={`tel:${siteConfig.supportPhone}`}
                className="hover:bg-surface-3 text-ink-muted hover:text-ink -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 text-[0.875rem] transition-colors"
              >
                <PhoneIcon className="text-ink-faint size-4" />
                <span className="numeral">{siteConfig.supportPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {items !== false && items.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, index) => (
              <AccordionItem
                key={item.value ?? item.question}
                value={item.value || `item-${index + 1}`}
              >
                <AccordionTrigger>
                  <span className="flex items-baseline gap-4">
                    <span className="type-label numeral text-ink-faint w-6 shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item.question}</span>
                  </span>
                </AccordionTrigger>
                {/* Indented to the question text, past the index column. */}
                <AccordionContent className="pl-10">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Container>
    </Section>
  );
}
