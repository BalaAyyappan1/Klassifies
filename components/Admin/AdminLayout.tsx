"use client";

import React, { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";



interface SidebarLayoutProps {
    children: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen">
            <AdminSidebar />

            <main className="flex-grow bg-[#FAFBFC] dark:bg-[#181818] flex flex-col overflow-y-auto">
               
                <div className="p-3">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default SidebarLayout;
