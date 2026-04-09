import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const AdminLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            const response = await axios.post(`${BACKEND_URL}/auth/login`, formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            if (response.status === 200) {
                localStorage.setItem("token", response.data.access_token);
                navigate("/adminpage");
            }
        } 
        catch (error: any) {
            if (error.response) {
                setError(error.response.data.detail || "Invalid credentials!");
            } else {
                setError("Network error, please try again");
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-400">
            <div className="w-sm bg-white px-10 py-8 rounded-2xl shadow-2xl">
                <h1 className="text-center text-3xl font-bold mb-8">Admin Login</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block font-semibold mb-2">
                            Username
                        </label>
                        <input type="text" id="username" placeholder="Enter username..." value={username} onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 rounded-lg placeholder-gray-500 border-2 border-gray-500 focus:outline-none" required/>
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block font-semibold mb-2">
                            Password
                        </label>
                        <input type="password" id="password" placeholder="Enter password..." value={password} onChange={(e) => setPassword(e.target.value)} 
                            className="w-full p-3 rounded-lg placeholder-gray-500 border-2 border-gray-500 focus:outline-none" required/>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                    
                    <button type="submit" className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition transform hover:scale-103 cursor-pointer">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};