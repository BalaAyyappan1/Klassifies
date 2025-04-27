import ForgotPassword from '@/components/Auth/ForgotPassword/ForgotPassword'
import React from 'react'

const page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#181818]">
      <div className="w-[444px]  max-w-md bg-white shadow-md rounded-[20px] p-6 dark:bg-[#1e1e1e] dark:text-white">

        <ForgotPassword />

      </div>
    </div>
  )
}

export default page
