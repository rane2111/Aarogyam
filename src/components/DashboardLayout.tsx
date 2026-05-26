import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  Heart,
  LayoutDashboard,
  Stethoscope,
  Calendar,
  Pill,
  Search,
  LogOut,
  Activity,
  Users,
  Package,
} from "lucide-react";
import type { TranslationKey } from "@/i18n/translations";

const patientNav: { titleKey: TranslationKey; url: string; icon: typeof LayoutDashboard }[] = [
  { titleKey: "dashboard", url: "/dashboard", icon: LayoutDashboard },
  { titleKey: "symptomChecker", url: "/symptom-checker", icon: Activity },
  { titleKey: "consultations", url: "/book-consultation", icon: Stethoscope },
  { titleKey: "findMedicine", url: "/medicines", icon: Search },
];

const doctorNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Requests", url: "/doctor-requests", icon: Users },
];

const pharmacyNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Medicine Stock", url: "/medicines", icon: Pill },
];

function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isPatient = role === "patient";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-2">
          <Heart className="h-6 w-6 shrink-0" />
          {!collapsed && <span className="font-bold text-lg">Aarogyam</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>{isPatient ? t("menu") : "Menu"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isPatient || !role
                ? patientNav.map((item) => (
                    <SidebarMenuItem key={item.titleKey}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent font-medium">
                          <item.icon className="mr-2 h-4 w-4" />
                          {!collapsed && <span>{t(item.titleKey)}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                : (role === "doctor" ? doctorNav : pharmacyNav).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent font-medium">
                          <item.icon className="mr-2 h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 space-y-2">
          {isPatient && <LanguageSwitcher collapsed={collapsed} />}
          {!collapsed && (
            <div className="mb-1 text-sm opacity-80">
              <p className="font-medium">{profile?.full_name || "User"}</p>
              <p className="text-xs capitalize opacity-60">{role}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={handleSignOut}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">{isPatient ? t("signOut") : "Sign Out"}</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-card px-4">
            <SidebarTrigger className="mr-4" />
            <h2 className="text-lg font-semibold text-card-foreground">Aarogyam</h2>
          </header>
          <main className="flex-1 p-6 bg-background">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
