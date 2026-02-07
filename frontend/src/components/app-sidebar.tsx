"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  TrendingUp,
  RotateCw,
  Trash2,
  FileText,
  PieChart,
  Brain,
  Calendar,
  Building2,
  Users,
  Settings,
  HelpCircle,
  Tag,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { SidebarNotification } from "@/components/sidebar-notification"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Finfox",
    email: "info@finfox.com",
    avatar: "",
  },
  navGroups: [
    {
      label: "Dashboards",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Fox AI",
          url: "/chat",
          icon: Sparkles,
        },
        {
          title: "Transactions",
          url: "/transactions",
          icon: TrendingUp,
        },
         {
          title: "Recurring Transactions",
          url: "/recurring-transactions",
          icon: RotateCw,
        },
        {
          title: "Debts",
          url: "/debts",
          icon: Trash2,
        },
        {
          title: "Bills",
          url: "/bills",
          icon: FileText,
        },
        {
          title: "Bill Companies",
          url: "/bill-company",
          icon: Building2,
        },
        {
          title: "Investments",
          url: "/investments",
          icon: PieChart,
        },
        {
          title: "Calendar",
          url: "/calendar",
          icon: Calendar,
        },
         {
          title: "Accounts",
          url: "/accounts",
          icon: Building2,
        },
        {
          title: "Users",
          url: "/users",
          icon: Users,
        },

      ],
    }
    // {
    //   label: "Utilities",
    //   items: [
    //     {
    //       title: "Settings",
    //       url: "#",
    //       icon: Settings,
    //       items: [
    //         {
    //           title: "User Settings",
    //           url: "/settings/user",
    //         },
    //         {
    //           title: "Account Settings",
    //           url: "/settings/account",
    //         },
    //         {
    //           title: "Plans & Billing",
    //           url: "/settings/billing",
    //         },
    //         {
    //           title: "Appearance",
    //           url: "/settings/appearance",
    //         },
    //         {
    //           title: "Notifications",
    //           url: "/settings/notifications",
    //         },
    //         {
    //           title: "Connections",
    //           url: "/settings/connections",
    //         },
    //       ],
    //     },
    //     {
    //       title: "FAQs",
    //       url: "/faqs",
    //       icon: HelpCircle,
    //     },
    //     {
    //       title: "Pricing",
    //       url: "/pricing",
    //       icon: Tag,
    //     },
    //   ],
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({
    name: "User",
    email: "user@example.com",
    avatar: "",
    role: "User"
  })
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Get user data from localStorage
    const currentUser = localStorage.getItem("current_user")
    if (currentUser) {
      try {
        const parsedUser = JSON.parse(currentUser)
        setUser({
          name: parsedUser.fullName || parsedUser.name || "User",
          email: parsedUser.email || "user@example.com",
          avatar: parsedUser.avatar || "",
          role: parsedUser.role || "User"
        })
        
        setUserRole(parsedUser.role || null)
      } catch (error) {
        console.error("Failed to parse user data:", error)
      }
    }
  }, [])

  // Filter nav groups to hide Users menu for non-admin users
  const filteredNavGroups = data.navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (item.title === "Users" && userRole !== "Admin") {
        return false
      }
      return true
    })
  }))

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-14 items-center justify-center text-primary-foreground">
                  <Logo size={46} className="text-current rounded-full" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Finfox</span>
                  <span className="truncate text-xs">Your AI finance manager</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
