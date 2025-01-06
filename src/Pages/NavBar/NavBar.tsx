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
  const { isLoggedIn , setIsLoggedIn} = useAuth();

  const handleLogout = () => {
    setIsLoggedIn(false);
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
            <NavigationMenuItem>
              <Link to="/judge">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Judge
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

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
        <NavigationMenuItem className="ml-auto">
          <ModeToggle />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
