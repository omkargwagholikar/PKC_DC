import React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { isLoggedIn, userInfo , setIsLoggedIn, setTokens} = useAuth();

  const handleLogout = async () => {
    // setTokens(null);
    // setIsLoggedIn(false);
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Failed to logout from server:', error);
    } finally {
      setTokens(null);
      setIsLoggedIn(false);
      window.location.href = '/login';
    }
    
  };

  return (
    <NavigationMenu className="p-4 border-b flex items-center">
      <NavigationMenuList className="flex items-center w-full">
        <NavigationMenuItem>
          <Link to="/">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/domains">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Domains
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        {isLoggedIn && (
          <>
          { userInfo?.isJudge  && 
            <NavigationMenuItem>
              <Link to="/judge">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Judge
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          }
            <NavigationMenuItem>
              <NavigationMenuLink
                onClick={handleLogout}
                className={navigationMenuTriggerStyle()}
              >
                Logout
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        )}
        {!isLoggedIn && 
            <NavigationMenuItem>
              <Link to="/login">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Login
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
        }
        <NavigationMenuItem className="ml-auto">
          <ModeToggle />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
