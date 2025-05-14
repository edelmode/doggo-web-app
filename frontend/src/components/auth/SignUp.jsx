import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUp({ toggleModal, openSignInModal, openTermsModal }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        realName: '',
        contactNumber: '',
        petName: '',
        petSex: '',
        petBreed: '',
        petAge: '',
    });
    
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage('');
            }, 5000); 
    
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflowY = 'auto';
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
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
        
        // Set loading state to true when form is submitted
        setIsLoading(true);
        setErrorMessage('');
        
        try {
            // Format the data correctly - ensure pet age is a number
            const dataToSend = {
                ...formData,
                petAge: parseInt(formData.petAge, 10) || 0 // Convert to integer or default to 0
            };
            
            const response = await fetch('https://testdockerbackend.azurewebsites.net/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });
    
            const data = await response.json();
            
            if (response.ok) {
                // Show verification message instead of redirecting
                setSubmitSuccess(true);
                setVerificationSent(true);
                setRegisteredEmail(formData.email);
                
                // We don't store the token or navigate to the account page
                // until the user verifies their email
            } else {
                setErrorMessage(`Registration failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setErrorMessage('An error occurred. Please try again later.');
        } finally {
            // Set loading state back to false after request completes
            setIsLoading(false);
        }
    };
    
    const handleResendVerification = async () => {
        if (!registeredEmail) return;
        
        setIsLoading(true);
        try {
            const response = await fetch('https://testdockerbackend.azurewebsites.net/api/auth/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: registeredEmail
                }),
            });
            
            if (response.ok) {
                alert('Verification email has been resent.');
            } else {
                const data = await response.json();
                setErrorMessage(`Failed to resend: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error resending verification:', error);
            setErrorMessage('An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative p-4 w-full max-w-md h-[70vh] bg-white rounded-lg shadow overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b rounded-t">
                    <h3 className="text-xl font-bold text-dark-pastel-orange">
                        Create a Doggo Account
                    </h3>
                    <button
                        onClick={toggleModal}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-2xl text-sm w-8 h-8 inline-flex justify-center items-center"
                        type="button"
                        disabled={isLoading}
                    >
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-4">
                    {submitSuccess && verificationSent ? (
                        <div className="text-center py-8">
                            <div className="text-green-500 text-4xl mb-4">✓</div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Registration Successful!</h2>
                            <p className="text-gray-600 mb-6">
                                We've sent a verification email to <strong>{registeredEmail}</strong>.
                                Please check your inbox and verify your account to continue.
                            </p>
                            <button
                                onClick={handleResendVerification}
                                className="text-dark-pastel-orange hover:underline mb-4"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Resend verification email'}
                            </button>
                            <div className="mt-4">
                                <button
                                    onClick={openSignInModal}
                                    className="w-full text-white bg-dark-pastel-orange hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
                                >
                                    Go to Sign In
                                </button>
                            </div>
                        </div>
                    ) : (
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
                                    className="text-sm rounded-lg block w-full p-2.5 border"
                                    placeholder="name@gmail.com"
                                    required
                                    disabled={isLoading}
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
                                        className="text-sm rounded-lg block w-full p-2.5 border"
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                                        disabled={isLoading}
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
                            <div>
                                <label htmlFor="realName" className="block mb-2 text-sm font-medium text-gray-900">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="realName"
                                    id="realName"
                                    value={formData.realName}
                                    onChange={handleInputChange}
                                    className="text-sm rounded-lg block w-full p-2.5 border"
                                    placeholder="John Doe"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="contactNumber" className="block mb-2 text-sm font-medium text-gray-900">
                                    Contact Number
                                </label>
                                <input
                                    type="tel"
                                    name="contactNumber"
                                    id="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    className="text-sm rounded-lg block w-full p-2.5 border"
                                    placeholder="Numbers only (e.g. 1234567890)"
                                    pattern="[0-9]*"
                                    required
                                    disabled={isLoading}
                                />
                                <small className="text-gray-500">Numbers only, no dashes or spaces</small>
                            </div>
                            <div>
                                <label htmlFor="petName" className="block mb-2 text-sm font-medium text-gray-900">
                                    Pet Name
                                </label>
                                <input
                                    type="text"
                                    name="petName"
                                    id="petName"
                                    value={formData.petName}
                                    onChange={handleInputChange}
                                    className="text-sm rounded-lg block w-full p-2.5 border"
                                    placeholder="Brownie"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="petSex" className="block mb-2 text-sm font-medium text-gray-900">
                                    Pet Sex
                                </label>
                                <select
                                    name="petSex"
                                    id="petSex"
                                    value={formData.petSex}
                                    onChange={handleInputChange}
                                    className="text-sm rounded-lg block w-full p-2.5 border"
                                    required
                                    disabled={isLoading}
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="petBreed" className="block mb-2 text-sm font-medium text-gray-900">
                                    Pet Breed
                                </label>
                                <input
                                    type="text"
                                    name="petBreed"
                                    id="petBreed"
                                    value={formData.petBreed}
                                    onChange={handleInputChange}
                                    className="text-sm rounded-lg block w-full p-2.5 border"
                                    placeholder="Golden Retriever"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="petAge" className="block mb-2 text-sm font-medium text-gray-900">
                                    Pet Age
                                </label>
                                <input
                                    type="number"
                                    name="petAge"
                                    id="petAge"
                                    value={formData.petAge}
                                    onChange={handleInputChange}
                                    className="text-sm rounded-lg block w-full p-2.5 border"
                                    placeholder="3"
                                    required
                                    disabled={isLoading}
                                    min="0"
                                    max="30"
                                />
                            </div>
                            <div className="text-sm text-gray-700">
                                By signing up, you agree to our{' '}
                                <a 
                                    href="#" 
                                    className={`text-dark-pastel-orange hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`} 
                                    onClick={isLoading ? null : openTermsModal}
                                >
                                    Terms and Conditions
                                </a>.
                            </div>
                            <button
                                type="submit"
                                className={`w-full text-white bg-dark-pastel-orange hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing up...' : 'Sign Up'}
                            </button>
                            <div className="text-sm font-medium text-gray-700">
                                Already have an account?{' '}
                                <a 
                                    href="#" 
                                    className={`text-dark-pastel-orange font-semibold hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`} 
                                    onClick={isLoading ? null : openSignInModal}
                                >
                                    Sign In
                                </a>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}