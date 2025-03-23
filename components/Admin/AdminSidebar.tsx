import React from 'react';
import { NavContents } from './NavContent';
import { usePathname } from "next/navigation";
import Link from 'next/link';

const AdminSidebar = () => {
  const pathname = usePathname();
  return (
    <div className="w-64 bg-white dark:bg-[#181818] border-r dark:border-gray-700">
      {NavContents.map((item) => (
        <li
          key={item.key}
          className={`mb-2 flex items-center hover:bg-[#4C88ED33] rounded pl-10 h-11 ${
            pathname === item.href ? "bg-[#4C88ED33]" : ""
          }`}
        >
          {item.text === "Logout" ? (
            <button className="flex items-center">
              {item.text}
            </button>
          ) : (
            <Link href={item.href}>
              <span className="flex items-center">{item.text}</span>
            </Link>
          )}
        </li>
      ))}
    </div>
  );
};

export default AdminSidebar;