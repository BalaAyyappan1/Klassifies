import Layout from '@/components/ReusableComponents/Layout'
import React from 'react'

const page = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl ">
          <div className=" overflow-hidden">
            {/* Hero Section */}
            <div className=" text-start">
              <h1 className="text-4xl font-bold text-black dark:text-white mb-2">About Klassifies.com</h1>
              <p className="text-xl text-gray-400 dark:text-gray-100">Connecting buyers and sellers with simplicity</p>
            </div>
            
            {/* Main Content */}
            <div className="mt-10">
              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  Klassifies.com is a completely free classified ads platform designed to make buying and selling effortless. 
                  Whether you&apos;re looking for cars, jobs, real estate, or anything else, our platform connects you with 
                  exactly what you need - no strings attached.
                </p>
                
                <div className="my-8 border-l-4 border-blue-500 pl-6">
                  <p className="font-semibold text-gray-800 italic">
                  &quot;Our mission is to create the simplest, most trustworthy classifieds experience - 100% free for everyone.&quot;
                  </p>
                </div>
                
            
                
                
                
              
               
              </div>
            </div>
            
            {/* CTA Section */}
           
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default page