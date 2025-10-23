"use client"

import { useState } from 'react'
import axios from "@/lib/axios"
import toast from 'react-hot-toast';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

const LoginForm = () => {

    const context = useContext(UserContext);
    if (!context) throw new Error("LoginForm must be within UserContextProvider");
    const { setUser, refreshUser } = context;

    const [currentState, setCurrentState] = useState("Login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await axios.get("/sanctum/csrf-cookie");

            if (currentState === "Login") {
                await axios.post("/api/login", { email, password });
                
            } else {
                await axios.post("/api/register", { name, email, password, password_confirmation: password });
            }

            const { data } = await axios.get("/api/user");
            setUser(data);
            router.push("/auth");

            const { data: user } = await axios.get("/api/user");
            console.log("Authenticated user:", user);

        } catch (error: any) {
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                if (validationErrors?.email) {
                    setError(validationErrors.email[0]); // e.g. "The email has already been taken."
                } else if (validationErrors?.password) {
                    setError(validationErrors.password[0]);
                } else {
                    setError("Validation failed");
                }
            } else if (currentState === "Login") {
                setError("Invalid email or password");
            } else {
                setError("Registration failed, please check your details");
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

            {
                currentState === "Register" 
                    && 
                <input 
                    onChange={(e) => setName(e.target.value)} 
                    value={name} 
                    type="text" 
                    placeholder="Your Name" 
                    className="w-full border rounded p-2 mb-3" />
            }

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
