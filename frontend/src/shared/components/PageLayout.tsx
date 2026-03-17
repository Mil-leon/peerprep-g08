import { type ReactNode } from "react";
import AppNavbar from "./Navbar";
interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 w-screen">
      <AppNavbar />
      <main className="flex-1 p-8 overflow-y-auto w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
