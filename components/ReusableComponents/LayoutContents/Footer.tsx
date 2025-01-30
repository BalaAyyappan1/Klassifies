import React from 'react';
import ThemeSwitch from '../ThemeSwitch';
import { FIcon, IIcon, XIcon } from '../Icons';
import Image from 'next/image';
import { FaHeart as HeartIcon } from 'react-icons/fa';

const Footer: React.FC = () => {
    return (
        <div className="border-t dark:border-[#333333]">
            <div className="w-full flex justify-end pr-4 mt-2">
                <ThemeSwitch />
            </div>


            <div className='space-y-3 items-center text-center py-2 flex flex-col'>
                <div className="flex space-x-4">
                    <Image src={XIcon} alt="" />
                    <Image src={FIcon} alt="" />
                    <Image src={IIcon} alt="" />
                </div>


                <div className="flex flex-wrap justify-center space-x-4">
                    <a href="/Home" className="no-underline text-[#1f41bb]">Home</a>
                    <a href="/About" className="no-underline text-[#1f41bb]">About</a>
                    <a href="/Locations" className="no-underline text-[#1f41bb]">Locations</a>
                    <a href="/Term" className="no-underline text-[#1f41bb]">Terms of Use</a>
                    <a href="/Contact" className="no-underline text-[#1f41bb]">Contact Us</a>
                    <a href="/Careers" className="no-underline text-[#1f41bb]">Careers</a>
                </div>


                <div className="text-center text-xs dark:text-white">
                    <span>Copyright © 2025 Klassifies. All rights reserved.</span>
                </div>


                <div className="flex items-center justify-center space-x-1 text-xs dark:text-white">
                    <span>Made with</span>
                    <HeartIcon className="text-red-500" />
                    <span>by Klassifies</span>
                </div>
            </div>


            {/* Theme Switch Section */}

        </div>
    );
};

export default Footer;
