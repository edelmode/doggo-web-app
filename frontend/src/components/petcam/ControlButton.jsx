import React, { useState } from 'react';
import { Mic } from 'lucide-react';

export default function ControlButtons({ loading, error, handleMicToggle }) {
    const [fetchStatus, setFetchStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    
    const handleStartFetch = async () => {
        try {
            setFetchStatus('loading');
            
            // Make API call to your backend that will trigger the IoT Hub direct method
            const response = await fetch('https://testdockerbackend.azurewebsites.net/api/control/run-sequence', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Include the device ID in the request
                body: JSON.stringify({ deviceId: 'doggoFetch' }),
            });
            
            // Parse the JSON response to check status
            const data = await response.json();
            
            if (!response.ok) {
                console.error('Server responded with error:', data);
                throw new Error(data.message || 'Failed to start fetch sequence');
            }
            
            console.log('Fetch sequence started successfully:', data);
            setFetchStatus('success');
            setTimeout(() => setFetchStatus('idle'), 3000); // Reset status after 3 seconds
        } catch (error) {
            console.error('Error starting fetch sequence:', error);
            setFetchStatus('error');
            setTimeout(() => setFetchStatus('idle'), 3000); // Reset status after 3 seconds
        }
    };
    
    // Determine button text based on status
    const getButtonText = () => {
        switch (fetchStatus) {
            case 'loading':
                return 'Running Sequence...';
            case 'success':
                return 'Sequence Started!';
            case 'error':
                return 'Failed to Start';
            default:
                return 'Start Fetch';
        }
    };
    
    // Determine button style based on status
    const getButtonClasses = () => {
        const baseClasses = "w-64 sm:w-80 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors duration-300";
        
        switch (fetchStatus) {
            case 'loading':
                return `${baseClasses} bg-gray-400 text-white cursor-not-allowed`;
            case 'success':
                return `${baseClasses} bg-green-500 text-white`;
            case 'error':
                return `${baseClasses} bg-red-500 text-white`;
            default:
                return `${baseClasses} text-black bg-bright-neon-yellow hover:bg-dark-grayish-orange hover:text-white focus:ring-4 focus:outline-none`;
        }
    };
    
    return (
        <div className="mt-5 text-center">
            <div className="mt-3 flex justify-center items-center flex-wrap gap-3 sm:gap-5">
                {/* Start Fetch Button */}
                <button
                    className={getButtonClasses()}
                    disabled={loading || error || fetchStatus === 'loading'}
                    onClick={handleStartFetch}
                >
                    {getButtonText()}
                </button>

                {/* Mic Button */}
                <button
                    onClick={handleMicToggle}
                    className="bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-3 shadow-lg"
                    disabled={loading || error}
                >
                    <Mic className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
            </div>
        </div>
    );
}