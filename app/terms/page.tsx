import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "用户协议",
  description: `使用${siteConfig.name}服务时适用的账户、内容与服务规则。`,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="用户协议"
      summary={`本协议由用户与${siteConfig.operator}共同订立，适用于${siteConfig.name}网站及其提供的在线数字服务。注册或使用服务前，请完整阅读本协议。`}
    >
      <LegalSection title="一、服务主体与适用范围">
        <p>
          星驰视界由{siteConfig.operator}
          运营，主要提供物理题目识别、动态画布生成、交互观察、账户及积分等在线服务。
        </p>
        <p>
          页面展示、实际开放能力及使用条件可能因版本、题型适配和服务状态有所不同，请以使用时页面提示为准。
        </p>
      </LegalSection>

      <LegalSection title="二、账户注册与安全">
        <p>
          用户应使用本人有权使用的手机号码注册，并保证提交信息真实、准确、有效。用户应妥善保管验证码、密码和账户，不得出租、出借、出售或以其他方式转让账户。
        </p>
        <p>
          如发现账户被异常使用，请立即通过本页所列客服渠道联系我们。因用户主动泄露认证信息或违反安全提示造成的损失，由用户依法承担相应责任。
        </p>
      </LegalSection>

      <LegalSection title="三、服务使用规则">
        <p>
          用户可按照页面指引上传题目、核对识别内容、生成或编辑动态画布。生成内容仅用于学习与教学辅助，可能受到图片质量、题目信息和模型适配程度影响，不应作为考试答案或专业决策的唯一依据。
        </p>
        <p>
          用户不得利用服务上传违法侵权内容、攻击系统、绕过权限或计费限制、批量抓取数据、干扰他人使用，或从事任何违反法律法规和公序良俗的活动。
        </p>
      </LegalSection>

      <LegalSection title="四、用户内容与知识产权">
        <p>
          用户应确保对上传的题目图片、文字和其他内容拥有合法使用权，不得侵犯他人的著作权、隐私权或其他合法权益。
        </p>
        <p>
          星驰视界的网站设计、程序、标识和平台自有内容受法律保护。未经书面许可，任何人不得复制、出售、反向工程或用于超出正常使用服务范围的商业用途。
        </p>
      </LegalSection>

      <LegalSection title="五、积分、订单与退款">
        <p>
          当前商品为一次性积分包，不属于自动续费会员。积分仅用于兑换平台内数字内容或生成服务，不具有现金价值，不可提现或转让。
        </p>
        <p>
          具体价格、到账数量、扣除方式及退款条件，以购买页面和《积分购买及退款规则》为准。支付前请仔细核对账户、商品和金额。
        </p>
      </LegalSection>

      <LegalSection title="六、服务调整与中断">
        <p>
          为保障安全、修复故障或改进功能，平台可能进行维护、升级或合理调整。对于计划性维护，我们会在条件允许时提前提示。发生不可抗力、网络故障或第三方服务异常时，我们会尽合理努力恢复服务。
        </p>
        <p>
          若用户严重违反本协议或法律规定，平台有权采取警告、限制功能、暂停或终止服务等必要措施，并依法保留追究责任的权利。
        </p>
      </LegalSection>

      <LegalSection title="七、未成年人使用">
        <p>
          未成年人应在监护人指导和同意下注册、使用服务及进行购买。监护人应帮助未成年人理解账户安全、个人信息保护与理性消费要求。
        </p>
      </LegalSection>

      <LegalSection title="八、协议更新与争议处理">
        <p>
          因法律变化或服务调整需要更新本协议时，平台会通过页面提示等合理方式公布。对用户权益有重大影响的变化，将依法提供适当提示。
        </p>
        <p>
          本协议适用中华人民共和国大陆地区法律。发生争议时，双方应先友好协商；协商不成的，可依法向有管辖权的人民法院提起诉讼。
        </p>
      </LegalSection>

      <LegalSection title="九、联系我们">
        <p>
          客服邮箱：{siteConfig.supportEmail}；客服电话：{siteConfig.supportPhone}。我们会在核实必要信息后尽快处理。
        </p>
      </LegalSection>
    </LegalPage>
  );
}
