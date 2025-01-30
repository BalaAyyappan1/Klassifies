"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/ReusableComponents/Layout';
import { categoryData } from '@/Data/Categories'; // Assuming you have your categoryData available
import { slugify } from '@/utils/slugify';

const Page = () => {
    const params= useParams();
    const { category } = params; // Get category from the URL

    // Find the selected main category by matching the category name
    const selectedCategory = categoryData.mainCategories.find(
        (cat) => slugify(cat.name) === category
    );

    if (!selectedCategory) {
        return <div>Category not found.</div>; // Handle case when category is not found
    }

    return (
        <div>
            <Layout>
                <div className='flex flex-row mt-10 mb-10'>
                    {/* Left Column (Sidebar) */}
                    <div className='h-[700px] w-[35%] p-4'>
                        {/* <p className="text-white">{selectedCategory.name}</p> */}
                        <div className="space-y-4">
                            {selectedCategory.subcategories.map((subcategory) => (
                                <div key={subcategory.id}>
                                    <p className="font-medium text-lg">{subcategory.name}</p>
                                    {/* Display sub-subcategories if any */}
                                    {subcategory.subcategories2 && subcategory.subcategories2.length > 0 && (
                                        <div className="ml-4">
                                            {subcategory.subcategories2.map((subSubcategory) => (
                                                <p key={subSubcategory.id} className="text-sm">
                                                    - {subSubcategory.name}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column (Main Content) */}
                    <div className='w-full p-4'>
                        <p>Main body for category: {selectedCategory.name}</p>
                    
                    </div>
                </div>
            </Layout>
        </div>
    );
};

export default Page;
