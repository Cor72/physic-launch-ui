"use client";

import Link from "next/link";
import * as React from "react";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import LaunchUI from "../logos/launch-ui";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

interface ComponentItem {
  title: string;
  href: string;
  description: string;
}

interface MenuItem {
  title: string;
  href?: string;
  isLink?: boolean;
  content?: ReactNode;
}

interface NavigationProps {
  menuItems?: MenuItem[];
  components?: ComponentItem[];
  logo?: ReactNode;
  logoTitle?: string;
  logoDescription?: string;
  logoHref?: string;
  introItems?: {
    title: string;
    href: string;
    description: string;
  }[];
}

export default function Navigation({
  menuItems = [
    {
      title: "认识平台",
      content: "default",
    },
    {
      title: "核心功能",
      content: "components",
    },
    {
      title: "积分套餐",
      isLink: true,
      href: siteConfig.links.pricing,
    },
  ],
  components = [
    {
      title: "题目图片输入",
      href: siteConfig.links.features,
      description: "上传清晰题目图片，让平台识别题意、物体和已知条件。",
    },
    {
      title: "题意与条件识别",
      href: siteConfig.links.features,
      description: "梳理题目中的运动阶段，并在生成前核对关键信息。",
    },
    {
      title: "动态画布生成",
      href: siteConfig.getStartedUrl,
      description: "把题目转化为可播放、可观察的动态物理场景。",
    },
    {
      title: "运动过程观察",
      href: siteConfig.links.features,
      description: "播放、暂停和回看，观察运动、受力与轨迹。",
    },
    {
      title: "画布编辑",
      href: siteConfig.links.features,
      description: "在画布中调整对象与参数，对照原题继续探索。",
    },
    {
      title: "账户与记录",
      href: siteConfig.canvasUrl,
      description: "登录后管理积分，并查看账户中的使用记录。",
    },
  ],
  logo = <LaunchUI />,
  logoTitle = siteConfig.name,
  logoDescription = "把抽象物理题转化为可观察、可操作的动态过程。",
  logoHref = siteConfig.getStartedUrl,
  introItems = [
    {
      title: "免费体验",
      href: siteConfig.getStartedUrl,
      description: "无需付费即可进入画布，体验当前开放的基础功能。",
    },
    {
      title: "使用流程",
      href: siteConfig.links.workflow,
      description: "了解从上传题目到观察动态过程的完整路径。",
    },
    {
      title: "适用场景",
      href: siteConfig.links.models,
      description: "查看平抛、斜面、圆周、弹簧与带电粒子等场景。",
    },
  ],
}: NavigationProps) {
  return (
    <NavigationMenu aria-label="主导航" className="hidden md:flex">
      <NavigationMenuList>
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.isLink ? (
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                asChild
              >
                <Link href={item.href || ""}>{item.title}</Link>
              </NavigationMenuLink>
            ) : (
              <>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  {item.content === "default" ? (
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="from-muted/30 to-muted/10 flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                            href={logoHref}
                          >
                            {logo}
                            <div className="mt-4 mb-2 text-lg font-medium">
                              {logoTitle}
                            </div>
                            <p className="text-muted-foreground text-sm leading-tight">
                              {logoDescription}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      {introItems.map((intro) => (
                        <ListItem
                          key={intro.title}
                          href={intro.href}
                          title={intro.title}
                        >
                          {intro.description}
                        </ListItem>
                      ))}
                    </ul>
                  ) : item.content === "components" ? (
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {components.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  ) : (
                    item.content
                  )}
                </NavigationMenuContent>
              </>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<"a"> & { title: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          data-slot="list-item"
          className={cn(
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none",
            className,
          )}
          {...props}
        >
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}
