import React, { useState } from 'react';
import { Mic } from 'lucide-react';

export default function ControlButtons({ loading, error, handleMicToggle }) {
    const [motorsRunning, setMotorsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const API_BASE_URL = 'https://testdockerbackend.azurewebsites.net/api/fetching';

    const runMotors = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/motors/run`);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            
            const data = await res.json();
            console.log('Motors Response:', data);
            
            setMotorsRunning(true);
            
            // After 8 seconds (which matches the sequence duration in the ESP32 code),
            // reset the button state to allow another run
            setTimeout(() => {
                setMotorsRunning(false);
            }, 8000);
            
        } catch (err) {
            console.error('Error running motors:', err);
            alert(`Could not run motors: ${err.message}`);
            setMotorsRunning(false);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="mt-5 text-center">
            <div className="mt-3 flex justify-center items-center flex-wrap gap-3 sm:gap-5">
                {/* Start Fetch Button */}
                <button
                    onClick={runMotors}
                    className={`text-white rounded-full px-6 py-3 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isLoading ? 'bg-gray-400' : 
                        motorsRunning ? 'bg-red-600 hover:bg-red-700' : 
                        'bg-dark-grayish-orange hover:bg-yellow'
                    }`}
                    disabled={isLoading || motorsRunning || loading || error}
                >
                    {isLoading ? 'Processing...' : 
                    motorsRunning ? 'MOTORS RUNNING...' : 
                    'Start Fetching'}
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
            
            {/* Status indicator */}
            {(motorsRunning || isLoading) && (
                <div className={`mt-3 text-center py-2 px-4 rounded-lg ${
                    motorsRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    <p className="font-medium">
                        Motors are {motorsRunning ? 'RUNNING' : 'INITIALIZING'}
                    </p>
                </div>
            )}
        </div>
    );
}