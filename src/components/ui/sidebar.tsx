/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  Home,
  FileText,
  DollarSign,
  UserCheck,
  ShoppingCart,
  TrendingUp,
  Users,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShimmerProfile } from '@/components/ui/shimmer';
import { useProfile } from '@/contexts/ProfileContext';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
}

export interface SidebarProps {
  items?: SidebarItem[];
  currentPath?: string;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  currentPath = '/',
  className
}) => {
  // Default sidebar items
  const defaultItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'invoices', label: 'Invoices', icon: FileText, href: '/invoices' },
    { id: 'financing', label: 'Financing', icon: DollarSign, href: '/financing' },
    { id: 'kyc', label: 'KYC', icon: UserCheck, href: '/kyc' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart, href: '/marketplace' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/analytics' },
    { id: 'users', label: 'Users', icon: Users, href: '/users' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' }
  ];
  
  const sidebarItems = items || defaultItems;
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Get initial state from localStorage, default to false
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Try to get profile context, but don't throw if not available
  let profile, isLoading, logout;
  try {
    const profileContext = useProfile();
    profile = profileContext.profile;
    isLoading = profileContext.isLoading;
    logout = profileContext.logout;
  } catch {
    // Context not available, don't show user info
    profile = undefined;
    isLoading = false;
    logout = () => {};
  }

  const userInfo = profile ? {
    name: `${profile.firstName} ${profile.lastName}`,
    email: profile.email,
    role: profile.role
  } : undefined;

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  };

  const SidebarContent = () => (
    <div className={cn(
      "h-full bg-card border-r border-border flex flex-col",
      isCollapsed ? "items-center" : ""
    )}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-bold text-foreground">Vestio</span>
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const newCollapsedState = !isCollapsed;
              setIsCollapsed(newCollapsedState);
              localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsedState));
            }}
            className="hidden lg:flex"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
            
            return (
              <a
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                
                {!isCollapsed && (
                  <motion.div
                    variants={contentVariants}
                    animate={isCollapsed ? 'collapsed' : 'expanded'}
                    className="flex items-center justify-between w-full"
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        isActive 
                          ? "bg-primary-foreground/20 text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                )}
              </a>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-border">
        {isLoading ? (
          <ShimmerProfile />
        ) : userInfo && (
          !isCollapsed ? (
            <motion.div
              variants={contentVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-medium text-sm">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{userInfo.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{userInfo.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userInfo.role}</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary-foreground font-medium text-sm">
                  {userInfo.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="w-full"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        className={cn("hidden lg:block h-screen sticky top-0", className)}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-background border"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 20 }}
              className="lg:hidden fixed left-0 top-0 h-full w-80 z-50"
            >
              <div className="relative h-full">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileOpen(false)}
                  className="absolute top-4 right-4 z-10"
                >
                  <X className="w-5 h-5" />
                </Button>
                <SidebarContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;