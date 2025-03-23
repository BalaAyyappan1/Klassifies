import AdminLayout from '@/components/Admin/AdminLayout';
import Video from '@/components/Admin/Video/Video';

import React from 'react';

const videoads: React.FC = () => {
    return (
        <div>
            <AdminLayout>
                <h1>Video Ads</h1>
                <Video />   
            </AdminLayout>
        </div>
    );
};

export default videoads;