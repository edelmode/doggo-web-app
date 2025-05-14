import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function VerifyAccount() {
    const [verificationStatus, setVerificationStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your account...');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (!token) {
            setVerificationStatus('error');
            setMessage('Invalid verification link. No token provided.');
            return;
        }

        const verifyAccount = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/auth/verify-account?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setVerificationStatus('success');
                    setMessage('Your account has been successfully verified!');
                } else {
                    setVerificationStatus('error');
                    setMessage(data.error || 'Verification failed. Please try again.');
                }
            } catch (error) {
                console.error('Error during verification:', error);
                setVerificationStatus('error');
                setMessage('An error occurred during verification. Please try again later.');
            }
        };

        verifyAccount();
    }, [location.search]);

    const handleRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow">
                {verificationStatus === 'verifying' && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark-pastel-orange mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Your Account</h2>
                        <p className="text-gray-600">Please wait while we verify your account...</p>
                    </div>
                )}

                {verificationStatus === 'success' && (
                    <div className="text-center">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Verified!</h2>
                        <p className="text-gray-600 mb-6">Your account has been successfully verified. You can now log in.</p>
                        <button
                            onClick={handleRedirect}
                            className="w-full text-white bg-dark-pastel-orange hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
                        >
                            Go to Login
                        </button>
                    </div>
                )}

                {verificationStatus === 'error' && (
                    <div className="text-center">
                        <div className="text-red-500 text-5xl mb-4">✗</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <button
                            onClick={handleRedirect}
                            className="w-full text-white bg-dark-pastel-orange hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}