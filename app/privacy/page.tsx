import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "隐私政策",
  description: `${siteConfig.name}处理账户、题目与订单信息的说明。`,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="隐私政策"
      summary={`${siteConfig.operator}重视个人信息保护。本政策说明星驰视界在提供账户、题目处理、积分购买和安全保障等服务时如何处理信息。`}
    >
      <LegalSection title="一、我们处理的信息">
        <p>
          账户与认证信息：注册或登录时使用的手机号码、验证码验证结果、账户标识及必要的安全验证信息。
        </p>
        <p>
          使用与内容信息：用户主动上传的题目图片、输入的题目内容、生成指令、画布操作及相关结果。请勿上传与题目无关的姓名、学校、联系方式、证件号码等个人信息。
        </p>
        <p>
          订单与客服信息：积分订单、支付结果、积分变化记录，以及用户联系客服时主动提供的联系方式、问题描述和必要凭证。平台不直接保存用户的支付账户密码。
        </p>
        <p>
          设备与日志信息：为保障运行与安全，可能处理访问时间、页面操作、浏览器或设备类型、网络地址、错误日志及风险识别所需信息。
        </p>
      </LegalSection>

      <LegalSection title="二、处理信息的目的">
        <p>
          我们仅在实现账户注册登录、题目识别与生成、画布功能、积分结算、订单核对、客服支持、安全防护、故障排查及依法履行义务所需范围内处理信息。
        </p>
        <p>
          若未来需要将信息用于本政策未说明的其他目的，我们会依法另行告知，并在需要时取得用户同意。
        </p>
      </LegalSection>

      <LegalSection title="三、受托处理与对外提供">
        <p>
          为完成短信验证、支付、题目识别、内容生成、基础设施或安全服务，我们可能委托具备相应能力的服务提供方处理完成服务所必需的信息，并通过合同和安全措施限制其用途。
        </p>
        <p>
          除取得用户单独同意、履行法定义务、保护重大合法权益或法律允许的其他情形外，我们不会向无关第三方出售或提供个人信息。
        </p>
      </LegalSection>

      <LegalSection title="四、保存与安全保护">
        <p>
          我们在实现处理目的所必需的期限内保存信息，并根据法律要求、纠纷处理和安全需要确定合理期限。超过期限后，将依法删除或匿名化处理，法律另有规定的除外。
        </p>
        <p>
          我们采取访问控制、传输保护、日志审计和安全监测等合理措施保护信息。互联网环境无法保证绝对安全，用户也应妥善保管账户凭证并及时报告异常。
        </p>
      </LegalSection>

      <LegalSection title="五、用户的权利">
        <p>
          用户可以依法请求查询、更正、补充、复制或删除个人信息，撤回基于同意的授权，以及注销账户。部分请求可能需要核验身份；法律要求继续保存的信息在保存期内将被限制处理。
        </p>
        <p>
          如需行使上述权利，请通过本页客服渠道联系我们。我们将在法律规定的期限内核实并处理。
        </p>
      </LegalSection>

      <LegalSection title="六、Cookie 与本地存储">
        <p>
          网站可能使用 Cookie 或浏览器本地存储维持登录状态、保存必要偏好、同步账户状态并保障安全。关闭必要存储可能导致登录或部分功能无法正常使用。
        </p>
      </LegalSection>

      <LegalSection title="七、未成年人保护">
        <p>
          未成年人应在监护人指导下使用服务。监护人如对未成年人信息处理有疑问，或需要行使相关权利，可通过客服渠道联系我们。
        </p>
      </LegalSection>

      <LegalSection title="八、政策更新与联系我们">
        <p>
          本政策发生重大变化时，我们会通过页面提示等合理方式告知。对本政策或个人信息保护有任何问题，可发送邮件至 {siteConfig.supportEmail}，或拨打 {siteConfig.supportPhone}。
        </p>
      </LegalSection>
    </LegalPage>
  );
}
