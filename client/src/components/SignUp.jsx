import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUp({ toggleModal, openSignInModal, openTermsModal }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (name === 'password') {
            validatePassword(value);
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const validatePassword = (password) => {
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
        } else if (!/[0-9!@#$%^&*]/.test(password)) {
            setErrorMessage('Password must contain at least one number or special character.');
        } else {
            setErrorMessage('');
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (errorMessage) {
            alert('Please fix the errors in the form before submitting.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (response.ok) {
                navigate('/account');
            } else {
                const errorData = await response.json();
                alert('Registration failed. Please try again.');
            }
        } catch (error) {
            alert('An error occurred. Please try again later.');
        }
    };
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow">
                <div className="flex items-center justify-between p-4 border-b rounded-t">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Create an Doggo account
                    </h3>
                    <button
                        onClick={toggleModal}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                        type="button"
                    >
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-4">
                    <form className="space-y-4" onSubmit={handleFormSubmit}>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                                Your email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="text-sm rounded-lg block w-full p-2.5 dark:bg-gray-100 border dark:border-gray-500 dark:placeholder-gray-400"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                                Create password
                            </label>
                            <div className="relative">
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="text-sm rounded-lg block w-full p-2.5 dark:bg-gray-100 border dark:border-gray-500 dark:placeholder-gray-400"
                                    placeholder="••••••••"
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
                            {errorMessage && (
                                <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
                            )}
                        </div>
                        <div className="text-sm text-gray-700">
                            By signing up, you agree to our{' '}
                            <a href="#" className="text-doggo hover:underline" onClick={openTermsModal}>
                                Terms and Conditions
                            </a>.
                        </div>
                        <button
                            type="submit"
                            className="w-full text-white bg-doggo hover:bg-yellow focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
                        >
                            Sign Up
                        </button>
                        <div className="text-sm font-medium text-gray-700">
                            Already have an account?{' '}
                            <a href="#" className="text-doggo hover:underline" onClick={openSignInModal}>
                                Sign In
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}