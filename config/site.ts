export const siteConfig = {
  name: "悟言视界",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  homeUrl: "#home",
  getStartedUrl: "#demo",
  ogImage: "/1.png",
  description:
    "面向中学物理师生的AI动态题目可视化学习平台，把抽象题目转化为可播放、可调参数、可观察受力与轨迹的动态过程。",
  version: "原型演示版",
  links: {
    features: "#features",
    models: "#models",
    pricing: "#pricing",
    faq: "#faq",
    teachers: "#teachers",
  },
  // 会员价格已确定；权益与使用额度仍为首版方案，可继续调整。
  pricing: {
    free: 0,
    monthly: 28,
    yearly: 288,
  },
  stats: {
    models: 5,
    audiences: 2,
    steps: 4,
    layers: 3,
  },
};

export type SiteConfig = typeof siteConfig;
