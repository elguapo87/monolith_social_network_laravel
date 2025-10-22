"use client"

import { useState } from 'react'

const LoginForm = () => {

    const [currentState, setCurrentState] = useState("Login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    return (
        <form className='bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm'>
            <h2 className="text-xl font-bold mb-4">
                {currentState === "Login" ? "Login" : "Register"}
            </h2>

            {error && <p className="text-red-500 mb-2">{error}</p>}

            {currentState === "Register" && <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder="Your Name" className="w-full border rounded p-2 mb-3" />}

            <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Email Address" className="w-full border rounded p-2 mb-3" />
            <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder="Password" className="w-full border rounded p-2 mb-3" />

            {
                currentState !== "Login"
                    ?
                <p className="text-sm text-gray-500">Already have account? <span onClick={() => setCurrentState("Login")} className="text-xs text-gray-400 cursor-pointer">Login here</span></p>
                    :
                <p className="text-sm text-gray-500">Don&apos;t have an account? <span onClick={() => setCurrentState("Register")} className="text-xs text-gray-400 cursor-pointer">Signup here</span></p>
            }

            <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 mt-3" disabled={loading}>
                {loading
                    ? (currentState === "Login") ? "Logging in..." : "Registering..."
                    : (currentState === "Login" ? "Login" : "Register")}
            </button>
        </form>
    )
}

export default LoginForm
