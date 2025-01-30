"use client";

import React, { ReactNode } from "react";
import TopBar from "./LayoutContents/TopBar";
import Footer from "./LayoutContents/Footer";

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen flex-col">
            <TopBar />
            <main className="flex-grow bg-[#FAFBFC] dark:bg-[#181818] flex flex-col overflow-y-auto">
                {children}
                <Footer />
            </main>

            
        </div>
    );
};

export default Layout;