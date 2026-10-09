import { Activity, BarChart3, Bot, Briefcase, CheckSquare, Globe2, Inbox, LayoutDashboard, Library, Megaphone, PlugZap, Send, Settings, ShieldCheck, Users, Wallet } from "lucide-react";

/** Primary navigation (PRD §18). `status` is shown truthfully: "planned" modules are not built yet. */
export const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard, status: "live" },
  { href: "/world", label: "PRAXIA World", icon: Globe2, status: "live" },
  { href: "/sales", label: "Sales", icon: BarChart3, status: "live" },
  { href: "/crm", label: "CRM", icon: Users, status: "live" },
  { href: "/outreach", label: "Outreach", icon: Send, status: "planned" },
  { href: "/marketing", label: "Marketing", icon: Megaphone, status: "planned" },
  { href: "/projects", label: "Projects", icon: Briefcase, status: "live" },
  { href: "/finance", label: "Finance", icon: Wallet, status: "live" },
  { href: "/agents", label: "AI Agents", icon: Bot, status: "live" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, status: "live" },
  { href: "/knowledge", label: "Knowledge", icon: Library, status: "planned" },
  { href: "/analytics", label: "Analytics", icon: Activity, status: "planned" },
  { href: "/approvals", label: "Approvals", icon: Inbox, status: "live" },
  { href: "/integrations", label: "Integrations", icon: PlugZap, status: "live" },
  { href: "/settings", label: "Settings", icon: Settings, status: "live" },
  { href: "/settings/audit", label: "Audit log", icon: ShieldCheck, status: "live" },
] as const;
