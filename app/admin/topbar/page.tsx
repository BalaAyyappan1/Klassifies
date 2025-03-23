
import React from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
// import axios from 'axios';
import TopBarPage from '@/components/Admin/TopBar/TopBarComponent';
// interface TopBar {
//     _id: string;
//     adName: string;
//     textColor: string;
//     bgColor: string;
//     fontSize: string;
//     link: string;
//   }

const topbar: React.FC = () => {
  //   const [topBars, setTopBars] = useState<TopBar[]>([]);

  // const fetchTopBars = async () => {
  //   try {
  //     const response = await axios.get('/api/admin/top-bar');
  //     setTopBars(response.data);
  //   } catch (error) {
  //     console.error('Error fetching top bars:', error);
  //   }
  // };
 return (
 <div>
        <AdminLayout>
        <div>
      <h1>Top Bars</h1>
      <TopBarPage />
    </div>
        </AdminLayout>
 </div>
 );
};

export default topbar;