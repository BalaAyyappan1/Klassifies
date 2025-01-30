import Signin from '@/components/Auth/Signin/Signin'
import Layout from '@/components/ReusableComponents/Layout'

import React from 'react'

const page = () => {
  return (
    <div>
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#181818]">
          <div className="w-[444px]  max-w-md bg-white shadow-md rounded-[20px] p-6 dark:bg-[#1e1e1e] dark:text-white">

            <Signin />

          </div>
        </div>

      </Layout>

    </div>

  )
}

export default page
