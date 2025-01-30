"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { handleLogin, loginWithGoogle } from '@/components/Api/Api';
import { GoogleIcon } from '@/components/ReusableComponents/Icons';
import LabelInput from '@/components/ReusableComponents/LabelInput';


const Signin: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
    const router = useRouter();

    const handleSubmit = async () => {
        setEmailError(""); // Clear previous errors
        setPasswordError(""); // Clear previous errors
        if (!email) {
          setEmailError("Email is required");
        }
        if (!password) {
          setPasswordError("Password is required");
        }
        if (email && password) {
          try {
            const response = await handleLogin(email, password);
            router.push("/");
            console.log(response.data);
          } catch (error) {
            setEmailError("Failed to sign in"); // Handle error appropriately
          }
        }
    };

    return (
        <div>
            <div className="flex flex-grow flex-col space-y-5 p-5 dark:bg-[#1e1e1e]">

                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold leading-[24.72px]">
                        Welcome to Klassifies
                    </h2>
                    <p className="text-[rgba(0,0,0,0.66)] dark:text-white text-sm leading-[22px]">
                        Sign into your account. If you don&apos;t have one, <br />
                        you&apos;ll be prompted to create one.
                    </p>
                </div>

                <div className="w-[304px] space-y-5 flex flex-col items-center justify-center mx-auto">
                    <LabelInput
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        labelText={''} 
                        htmlFor={'email'} 
                        className='mb-0 w-full'  
                        errorMessage={emailError}                />
                    <LabelInput
                        type="password"
                        labelText={''} 
                        htmlFor={'password'}    
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className='mb-0 w-full'  
                        errorMessage={passwordError} 
                    />

                    <Link href="/auth/forgot-password" className="ml-auto">
                        <span className="font-medium">Forgot Password?</span>
                    </Link>

                    <button
                        onClick={handleSubmit}
                        className="relative w-full h-[44px] bg-blue-800 group-hover:bg-blue-800 transition-all duration-300 text-white py-2 rounded flex items-center justify-center dark:bg-blue-700 hover:bg-blue-700"
                    >
                        <span className="flex-grow text-center">Login</span>
                        
                    </button>
                </div>

                <div className="space-y-5">
                    <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-[#8D8B8B]"></div>
                        <span className="mx-4 text-[#9B9797]">OR</span>
                        <div className="flex-grow border-t border-[#8D8B8B]"></div>
                    </div>

                    <Link href="/auth/signup">
                        <div className="text-center">
                            <span>Don't have an account? </span>
                            <span className="font-medium">Signup here</span>
                        </div>
                    </Link>

                    <div className="px-5">
                        <button
                            onClick={loginWithGoogle}
                            className="relative w-full h-[44px] bg-blue-800 text-white py-2 rounded flex items-center justify-center dark:bg-blue-800 hover:bg-blue-700 transition-all duration-300"
                        >
                            <span className="flex-grow text-center group-hover:text-gray-300">
                                Continue With Google
                            </span>
                            <div className="absolute left-2 p-2 rounded-full w-[35px] h-[35px] text-white dark:text-black flex items-center justify-center bg-transparent group-hover:bg-gray-800 transition-all duration-300">
                                <Image src={GoogleIcon} alt={"logo"} />
                            </div>
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Signin;