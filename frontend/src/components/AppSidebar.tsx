import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, FileText, Lock, Shield } from "lucide-react";

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const menuItems = [
    {
      title: "Home",
      icon: Home,
      id: "home",
    },
    {
      title: "My Manuscripts",
      icon: FileText,
      id: "manuscripts",
    },
    {
      title: "Submit Manuscript",
      icon: Lock,
      id: "submit",
    },
    {
      title: "About",
      icon: Shield,
      id: "about",
    },
  ];

  const handleClick = (id: string) => {
    onViewChange(id);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleClick(item.id)}
                    isActive={activeView === item.id}
                    tooltip={item.title}
                    className="transition-all duration-200 active:scale-95 hover:translate-x-1"
                  >
                    <item.icon className="transition-transform duration-200 group-hover:scale-110" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

