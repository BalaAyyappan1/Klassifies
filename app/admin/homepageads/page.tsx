import React from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import HomePageAds from '@/components/Admin/HomePageAds/HomePageAds';
const homepageads: React.FC = () => {
 return (
 <div>
    <AdminLayout>
        <HomePageAds />
    </AdminLayout>

 </div>
 );
};

export default homepageads;