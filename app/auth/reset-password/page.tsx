import React from 'react'
import ResetPassword from '@/components/Auth/ForgotPassword/ResetPassword'

const page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-[#181818] bg-gray-100 ">
      <div className="w-[444px]  max-w-md bg-white shadow-md rounded-[20px] p-6 dark:bg-[#1e1e1e] dark:text-white">

        <ResetPassword />

      </div>
    </div>
  )
}

export default page
