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
      title: "会员方案",
      isLink: true,
      href: siteConfig.links.pricing,
    },
  ],
  components = [
    {
      title: "拍照识题",
      href: siteConfig.links.features,
      description: "从图片或文字中提取物体、已知条件与待求内容。",
    },
    {
      title: "过程拆解",
      href: siteConfig.links.features,
      description: "按运动阶段梳理题目，把复杂情境逐步展开。",
    },
    {
      title: "动态演示",
      href: siteConfig.getStartedUrl,
      description: "播放、暂停与回看，观察物体怎样运动。",
    },
    {
      title: "受力与轨迹",
      href: siteConfig.links.features,
      description: "让速度方向、受力变化和运动轨迹同步呈现。",
    },
    {
      title: "参数调节",
      href: siteConfig.links.features,
      description: "改变初速度、摩擦系数等条件，探索运动结果。",
    },
    {
      title: "教师讲授",
      href: siteConfig.links.teachers,
      description: "围绕关键节点讲解，让课堂上的物理过程更清楚。",
    },
  ],
  logo = <LaunchUI />,
  logoTitle = siteConfig.name,
  logoDescription = "把看不懂的物理题，变成看得见、能操作的动态过程。",
  logoHref = siteConfig.getStartedUrl,
  introItems = [
    {
      title: "观看演示",
      href: siteConfig.getStartedUrl,
      description: "从一道圆轨道题，了解文字到动态场景的表达方式。",
    },
    {
      title: "题型模型",
      href: siteConfig.links.models,
      description: "首期聚焦五类适合动态展示的高频物理模型。",
    },
    {
      title: "使用说明",
      href: siteConfig.links.faq,
      description: "了解原型进度、学习方式与后续功能规划。",
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
