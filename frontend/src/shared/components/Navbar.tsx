import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@heroui/react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import PeerprepIcon from "../../assets/images/peerprep-logo.png";

export const PeerprepLogo = () => {
  return (
    <img src={PeerprepIcon} alt="Peerprep" className="h-50 w-50" />
  );
};

export default function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "History", path: "/history" },
    { name: "Questions", path: "/questions" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <Navbar
      classNames={{
        item: [
          "flex",
          "relative",
          "h-full",
          "items-center",
          "data-[active=true]:after:content-['']",
          "data-[active=true]:after:absolute",
          "data-[active=true]:after:bottom-0",
          "data-[active=true]:after:left-0",
          "data-[active=true]:after:right-0",
          "data-[active=true]:after:h-[2px]",
          "data-[active=true]:after:rounded-[2px]",
          "data-[active=true]:after:bg-primary",
        ],
      }}
    >
      <NavbarBrand>
        <PeerprepLogo />
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
            
          return (
            <NavbarItem key={item.name} isActive={isActive}>
              <Link
                as={RouterLink}
                to={item.path}
                color={isActive ? "primary" : "foreground"}
                aria-current={isActive ? "page" : undefined}
              >
                {item.name}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="#" onClick={() => {
                localStorage.removeItem("token");
                navigate("/login"); 
              }}>Logout</Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
