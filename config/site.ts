export const siteConfig = {
  name: "星驰视界",
  operator: "武汉市弧光科技有限公司",
  icpNumber: "鄂ICP备2024084733号-4",
  icpUrl: "https://beian.miit.gov.cn/",
  supportEmail: "1376848042@qq.com",
  supportPhone: "18672217115",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  homeUrl: "#home",
  getStartedUrl: "#demo",
  canvasUrl: "/canvas",
  loginUrl: "/login",
  registerUrl: "/register",
  ogImage: "/1.png",
  description:
    "面向中学物理师生的AI动态题目可视化学习平台，把抽象题目转化为可播放、可调参数、可观察受力与轨迹的动态过程。",
  links: {
    features: "#features",
    models: "#models",
    workflow: "#workflow",
    pricing: "#pricing",
    faq: "#faq",
    terms: "/terms",
    privacy: "/privacy",
    pointsPolicy: "/points-policy",
  },
};

export type SiteConfig = typeof siteConfig;
