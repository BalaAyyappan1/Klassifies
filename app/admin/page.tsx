import Adminlayout from '@/components/Admin/AdminLayout';
import React from 'react';
import { TotalUsers } from '@/components/Admin/Users/TotalUsers';
import { User } from '@/components/Admin/Users/User';
import TotalAdsTable from '@/components/Admin/Users/TotalAds';

const page: React.FC = () => {
    return (
        <div>
            <Adminlayout>
                <div className=' gap-5'>
                    {/* <TotalUsers /> */}
                    <User />
                </div>
                <div className='mt-20'>
                   
                </div>

            </Adminlayout>
        </div>
    );
};

export default page;