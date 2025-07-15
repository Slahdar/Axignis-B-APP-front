import { NavLink, useLocation } from "react-router-dom";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { 
  Wrench, 
  Package, 
  FileText, 
  Building, 
  Tags,
  Home,
  Globe,
  Users,
  LogOut,
  FolderTree,
  Settings,
  FileType,
  Shield
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Tableau de bord", url: "/", icon: Home },
  { title: "Équipements", url: "/equipments", icon: Wrench },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Marques", url: "/brands", icon: Building },
  { title: "Domaines", url: "/domains", icon: Globe },
  { title: "Familles", url: "/families", icon: FolderTree },
  { title: "Types d'équipements", url: "/equipment-types", icon: Settings },
  { title: "Types de documents", url: "/document-types", icon: FileType },
  { title: "Utilisateurs", url: "/users", icon: Users },
  { title: "Permissions", url: "/user-permissions", icon: Shield },
  { title: "Inventaire", url: "/inventory", icon: Package },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    return isActive(path)
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground";
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-button">
              <Building className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-heading font-bold text-foreground">ArchSafe Pro</h2>
                <p className="text-xs text-muted-foreground font-medium">Sécurité & Architecture</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button 
                    onClick={handleLogout}
                    className="text-muted-foreground hover:bg-muted/50 hover:text-foreground w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span>Déconnexion</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  async function handleLogout() {
    try {
      await apiService.logout();
      toast.success("Déconnexion réussie");
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      apiService.clearToken();
      window.location.reload();
    }
  }
}