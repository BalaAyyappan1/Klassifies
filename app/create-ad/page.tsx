import TitleDescriptionStep from '@/components/Ad/TitleDescriptionStep';
import TitleDesForm from '@/components/Ad/MultiStepForm';
import React from 'react';
import MultiStepForm from '@/components/Ad/MultiStepForm';
import Layout from '@/components/ReusableComponents/Layout';

const CreateAd: React.FC = () => {

    
    return (
        <div className=''>
            <Layout>
            <div className="flex items-center justify-center p-10 mb-[120px] mt-20">
                <div className='w-[800px] bg-white shadow-md rounded-[20px] p-6 dark:bg-[#1e1e1e]'> 
                    <MultiStepForm  />
            
                
                </div>
</div>
            </Layout>
        </div>
    );
};

export default CreateAd;