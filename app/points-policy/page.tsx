import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "积分购买及退款规则",
  description: `${siteConfig.name}一次性积分包的购买、使用、有效期与退款规则。`,
};

export default function PointsPolicyPage() {
  return (
    <LegalPage
      title="积分购买及退款规则"
      summary="请在购买前确认积分数量、金额、用途与退款条件。当前商品为一次性积分包，不是会员订阅，不会自动续费。"
    >
      <LegalSection title="一、积分性质与用途">
        <p>
          星驰视界积分是用于计量平台内数字内容和生成服务使用额度的虚拟权益，不是货币、储值卡或投资产品，不产生利息，不支持提现、转让、赠与或兑换现金。
        </p>
        <p>
          不同功能所需积分可能不同。每次操作前请以功能页面展示的扣除数量为准，并在确认后使用。
        </p>
      </LegalSection>

      <LegalSection title="二、一次性积分包">
        <p>
          当前售卖的是一次性积分包。每笔订单只收取页面确认的一次费用，不按月或按年自动扣款，也不自动续费。
        </p>
        <p>
          套餐名称、价格、到账积分和可用支付方式，以购买页面实时展示及支付确认页为准。请在支付前核对登录账户、商品和金额。
        </p>
      </LegalSection>

      <LegalSection title="三、到账与有效期">
        <p>
          支付成功后，积分通常会自动计入当前购买账户。用户可在账户页面查看余额和记录；如长时间未到账，请保留订单号和支付凭证并联系客服。
        </p>
        <p>
          已到账积分长期有效，不设置固定到期日。因严重违规导致账户依法被限制、用户主动注销账户或平台依法终止服务的，按照用户协议及适用法律处理。
        </p>
      </LegalSection>

      <LegalSection title="四、退款规则">
        <p>
          积分及其兑换的内容属于在线数字服务，具有即时交付、使用后难以恢复的特点。支付前请审慎确认，积分到账后原则上不支持无理由退款；付费积分一旦部分或全部使用，不支持因个人原因申请退款，法律另有规定的除外。
        </p>
        <p>
          如付费积分完全未使用，用户可以联系客服提交退款申请。平台将结合订单状态、积分记录、支付渠道规则及法律规定审核，提交申请不代表退款必然成立。
        </p>
        <p>
          因重复扣款、支付成功但积分未到账，或平台原因导致已购买服务无法提供的，经核实后将采取补发积分、恢复服务或按原支付路径退款等适当处理。活动赠送、补偿或其他未实际支付对价获得的积分不折现退款。
        </p>
      </LegalSection>

      <LegalSection title="五、退款申请所需信息">
        <p>
          申请时请提供注册手机号的必要核验信息、订单号、支付时间、支付金额、问题说明及必要凭证。请勿通过非官方渠道提供支付密码、短信验证码或完整银行卡信息。
        </p>
      </LegalSection>

      <LegalSection title="六、发票与订单凭证">
        <p>
          如需开具发票，请保留订单信息，并通过客服邮箱 {siteConfig.supportEmail} 或客服电话 {siteConfig.supportPhone} 联系办理。开票内容和形式按照实际交易及适用税务规定执行。
        </p>
      </LegalSection>

      <LegalSection title="七、账户注销与规则更新">
        <p>
          注销账户前，请先处理未完成订单、退款申请和剩余积分。账户注销后，相关权益可能无法继续使用或恢复，请谨慎操作。
        </p>
        <p>
          因法律变化或服务调整需要更新本规则时，平台会通过页面提示等合理方式公布。已完成订单按照购买时有效规则和法律规定处理，但对用户更有利或法律另有要求的除外。
        </p>
      </LegalSection>

      <LegalSection title="八、联系我们">
        <p>
          客服邮箱：{siteConfig.supportEmail}；客服电话：{siteConfig.supportPhone}。为保护账户安全，我们可能先核验与订单相关的必要信息。
        </p>
      </LegalSection>
    </LegalPage>
  );
}
