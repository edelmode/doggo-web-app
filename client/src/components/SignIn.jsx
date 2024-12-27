import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/outline';
import { Eye, EyeOff } from 'lucide-react';

export default function SignIn({ toggleModal, openSignUpModal, openForgotPassModal }) {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [email, setEmail] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);


    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const password = e.target.password.value;

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Login failed: ${errorMessage}`);
            }

            const data = await response.json();
    
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            if (rememberMe) {
                localStorage.setItem('savedEmail', email);
            } else {
                localStorage.removeItem('savedEmail');
            }

            navigate('/fetching-page');
        } catch (error) {
            setError(error.message);
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow">
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-black">
                        Sign in to DOGGO
                    </h3>
                    <button
                        onClick={toggleModal}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        type="button"
                    >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                {/* Modal body */}
                <div className="p-4 md:p-5">
                    {error && (
                        <div className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                            <ExclamationCircleIcon className="w-5 h-5 mr-2 text-red-700" />
                            <span>{error}</span>
                        </div>
                    )}
                    <form className="space-y-4" onSubmit={handleFormSubmit}>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">
                                Your email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="text-sm rounded-lg block w-full p-2.5 dark:bg-gray-100 border dark:border-gray-500 dark:placeholder-gray-400"
                                placeholder="name@company.com"
                                required
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">
                                Your password
                            </label>
                            <div className="relative">
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    name="password"
                                    id="password"
                                    placeholder="••••••••"
                                    className="text-sm rounded-lg block w-full p-2.5 dark:bg-gray-100 border dark:border-gray-500 dark:placeholder-gray-400"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                                >
                                    {passwordVisible ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-[#DDDDD]-800"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                </div>
                                <label htmlFor="remember" className="ms-2 text-sm font-medium text-black-300 dark:text-black-300">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" className="text-sm text-doggo hover:underline dark:text-doggo" onClick={openForgotPassModal}>
                                Forgot Password?
                            </a>
                        </div>
                        <button
                            type="submit"
                            className="w-full text-white bg-doggo hover:bg-yellow focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"   
                        >
                            Sign In
                        </button>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-700">
                            Don't have an account?{' '}
                            <a href="#" className="text-doggo hover:underline dark:text-doggo" onClick={openSignUpModal}>
                                Sign Up
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}