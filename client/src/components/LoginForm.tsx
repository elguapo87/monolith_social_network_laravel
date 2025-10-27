"use client"

import { useState } from 'react'
import axios from "@/lib/axios"
import type { AxiosError } from "axios";
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { assets } from '../../public/assets';
import { ImageKitClient } from 'imagekitio-next';

interface MyImageKitOptions {
    publicKey: string;
    urlEndpoint: string;
    authenticationEndpoint: string;
};

const LoginForm = () => {

    const context = useContext(UserContext);
    if (!context) throw new Error("LoginForm must be within UserContextProvider");
    const { setUser } = context;

    const [currentState, setCurrentState] = useState("Login");
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const showError = (message: string) => {
        setError(message);
        setTimeout(() => setError(null), 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await axios.get("/sanctum/csrf-cookie");

            if (currentState === "Register") {
                await axios.post("/api/register", {
                    full_name: fullName,
                    user_name: username,
                    email,
                    password,
                    password_confirmation: password,
                });

                if (image) {
                    // upload image if provided
                    const imageKit = new ImageKitClient({
                        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
                        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
                        authenticationEndpoint: "http://localhost:8000/api/imagekit-auth"
                    } as MyImageKitOptions);

                    const { data: authData } = await axios.get("/api/imagekit-auth");

                    const uploadRes = await imageKit.upload({
                        file: image,
                        fileName: `${username}_profile.jpg`,
                        folder: "/monolith/user_images",
                        signature: authData.signature,
                        token: authData.token,
                        expire: authData.expire,
                    });

                    await axios.put("/api/user/profile-picture", {
                        profile_picture: uploadRes.url
                    });
                }

            } else {
                await axios.post("/api/login", { email, password });
            }
            
            const { data: user } = await axios.get("/api/user");
            setUser(user);
            router.push("/auth");

        } catch (err) {
            const error = err as AxiosError<{ errors?: Record<string, string[]> }>;

            if (error.response?.status === 422) {
                const validationErrors = error.response.data?.errors;
                if (validationErrors?.email) {
                    showError(validationErrors.email[0]);
                } else if (validationErrors?.password) {
                    showError(validationErrors.password[0]);
                
                } else if (validationErrors?.user_name) {
                    showError(validationErrors.user_name[0]);
                } else {
                    showError("Validation failed");
                }
            } else if (currentState === "Login") {
                showError("Invalid email or password");
            } else {
                showError("Registration failed, please check your details");
            }

        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className='bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm'>
            <h2 className="text-xl font-bold mb-4">
                {currentState === "Login" ? "Login" : "Register"}
            </h2>

            {error && <p className="text-red-500 mb-2">{error}</p>}

            {currentState === "Register" && (
                <>
                    <label htmlFor="profileImage">
                        <input
                            onChange={(e) => e.target.files && setImage(e.target.files[0])}
                            type="file"
                            accept='image/*'
                            hidden
                            id='profileImage'
                        />
                        <Image 
                            src={image ? URL.createObjectURL(image) : assets.avatar_icon}
                            alt=''
                            width={48}
                            height={48}
                            className="w-12 h-12 aspect-square rounded-full object-cover mb-2"
                        />
                    </label>
                    <input 
                        onChange={(e) => setFullName(e.target.value)} 
                        value={fullName} 
                        type="text" 
                        placeholder="Your Name" 
                        className="w-full border rounded p-2 mb-3" 
                    />
                    <input 
                        onChange={(e) => setUsername(e.target.value)} 
                        value={username} 
                        type="text" 
                        placeholder="Your Username" 
                        className="w-full border rounded p-2 mb-3" 
                    />

                </>
            )}

            <input 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                type="email" 
                placeholder="Email Address" 
                className="w-full border rounded p-2 mb-3" 
            />
            <input 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                type="password" 
                placeholder="Password" 
                className="w-full border rounded p-2 mb-3" 
            />

            {
                currentState !== "Login"
                    ?
                <p 
                    className="text-sm text-gray-500">
                        Already have account? 
                        <span onClick={() => setCurrentState("Login")} 
                            className="text-xs text-gray-400 cursor-pointer">
                            Login here
                        </span>
                </p>
                    :
                <p 
                    className="text-sm text-gray-500">
                        Don&apos;t have an account? 
                        <span 
                            onClick={() => setCurrentState("Register")} 
                            className="text-xs text-gray-400 cursor-pointer">
                            Signup here
                        </span>
                </p>
            }

            <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 mt-3" 
                disabled={loading}
            >
                {loading
                    ? (currentState === "Login") ? "Logging in..." : "Registering..."
                    : (currentState === "Login" ? "Login" : "Register")}
            </button>
        </form>
    )
}

export default LoginForm
