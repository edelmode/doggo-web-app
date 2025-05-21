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
            
            <div className="mt-3 flex flex-col justify-center items-center gap-3 sm:gap-5">
                {/* Status indicator */}
                <div className={`text-center py-2 px-4 rounded-lg ${
                motorsRunning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                <p className="font-medium">
                    Motors are {motorsRunning ? 'RUNNING' : 'READY'}
                </p>
                </div>
                
                {/* Control Buttons - Now in the same row */}
                <div className="flex flex-row items-center justify-center gap-3 w-full">
                    <button 
                        className={`text-md font-lg text-white rounded-full px-6 py-3 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isLoading ? 'bg-gray-400' : 
                        motorsRunning ? 'bg-red-600 hover:bg-red-700' : 
                        'bg-dark-pastel-orange hover:bg-dark-grayish-orange'
                        }`}
                        onClick={runMotors}
                        disabled={isLoading || motorsRunning}
                    >
                        {isLoading ? 'Initializing...' : 
                        motorsRunning ? 'Cooling Down...' : 
                        'Start Fetching'}
                    </button>
                    <button
                        onClick={handleMicToggle}
                        className="bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-3 shadow-lg"
                        disabled={loading || error}
                    >
                        <Mic className="w-4 h-4 sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}