import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface NavigationItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
  target: string;
  requires_auth: boolean;
  user_types: string[];
  children?: NavigationItem[];
}

interface NavigationMenu {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
  user_types: string[];
  items: NavigationItem[];
}

interface DynamicNavigationProps {
  location: 'header' | 'footer' | 'sidebar';
  userType?: string;
  isAuthenticated?: boolean;
}

export function DynamicNavigation({ 
  location, 
  userType = 'visitor', 
  isAuthenticated = false 
}: DynamicNavigationProps) {
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNavigationMenus();
    
    const subscription = supabase
      .channel('navigation_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'navigation_menus' },
        () => fetchNavigationMenus()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'navigation_items' },
        () => fetchNavigationMenus()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [location, userType]);

  const fetchNavigationMenus = async () => {
    const { data: menusData } = await supabase
      .from('navigation_menus')
      .select(`
        *,
        items:navigation_items(*)
      `)
      .eq('location', location)
      .eq('is_active', true);

    if (menusData) {
      const filteredMenus = menusData
        .filter(menu => 
          menu.user_types.includes('all') || 
          menu.user_types.includes(userType)
        )
        .map(menu => ({
          ...menu,
          items: menu.items
            .filter((item: NavigationItem) => 
              item.is_active &&
              (item.user_types.includes('all') || item.user_types.includes(userType)) &&
              (!item.requires_auth || isAuthenticated)
            )
            .sort((a: NavigationItem, b: NavigationItem) => a.order_index - b.order_index)
        }));

      setMenus(filteredMenus);
    }
    setLoading(false);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.url?.startsWith('http')) {
      window.open(item.url, item.target);
    } else if (item.url) {
      window.location.href = item.url;
    }
  };

  if (loading) return <div className="animate-pulse h-8 bg-gray-200 rounded"></div>;

  return (
    <div className={`dynamic-navigation ${location}`}>
      {menus.map(menu => (
        <nav key={menu.id} className="flex gap-4">
          {menu.items.map(item => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleItemClick(item)}
              className="text-sm hover:text-blue-600"
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </Button>
          ))}
        </nav>
      ))}
    </div>
  );
}