import React, { useState } from 'react';
import { Mic } from 'lucide-react';

export default function ControlButtons({ loading, error, handleMicToggle }) {
    const [fetchStatus, setFetchStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [directControlEnabled, setDirectControlEnabled] = useState(false);
    const [directControlUrl, setDirectControlUrl] = useState('');
    
    // Function to check if direct control is available
    const checkDirectControl = async () => {
        try {
            // Make a request to find ESP32's IP address - this would come from your backend
            const response = await fetch('https://testdockerbackend.azurewebsites.net/api/devices/get-esp32-ip', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.ipAddress) {
                    setDirectControlUrl(`http://${data.ipAddress}`);
                    setDirectControlEnabled(true);
                    console.log('Direct control available at:', data.ipAddress);
                }
            }
        } catch (error) {
            console.log('Direct control not available, falling back to IoT Hub');
        }
    };
    
    // Check for direct control on component mount
    React.useEffect(() => {
        checkDirectControl();
    }, []);
    
    const handleStartFetch = async () => {
        try {
            setFetchStatus('loading');
            
            // Try direct control first if available
            if (directControlEnabled && directControlUrl) {
                try {
                    console.log('Trying direct control at:', directControlUrl);
                    const directResponse = await fetch(`${directControlUrl}/run`, {
                        method: 'GET',
                        // Short timeout to fail quickly if the ESP32 is not reachable
                        signal: AbortSignal.timeout(3000)
                    });
                    
                    if (directResponse.ok) {
                        console.log('Direct control successful');
                        setFetchStatus('success');
                        setTimeout(() => setFetchStatus('idle'), 3000);
                        return;
                    }
                } catch (directError) {
                    console.log('Direct control failed, falling back to IoT Hub');
                }
            }
            
            // Fall back to IoT Hub control
            console.log('Using IoT Hub control');
            const response = await fetch('https://testdockerbackend.azurewebsites.net/api/control/run-sequence', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    deviceId: 'doggoFetch',
                    // Add detailed command parameters
                    command: 'runSequence',
                    parameters: {
                        motor1Speed: 255,
                        motor2Speed: 255,
                        stepperSteps: 100
                    }
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('Server responded with error:', data);
                throw new Error(data.message || 'Failed to start fetch sequence');
            }
            
            console.log('Fetch sequence started successfully:', data);
            setFetchStatus('success');
            setTimeout(() => setFetchStatus('idle'), 3000);
        } catch (error) {
            console.error('Error starting fetch sequence:', error);
            setFetchStatus('error');
            setTimeout(() => setFetchStatus('idle'), 3000);
        }
    };
    
    const stopMotors = async () => {
        try {
            // Try direct control first if available
            if (directControlEnabled && directControlUrl) {
                try {
                    const directResponse = await fetch(`${directControlUrl}/stop`, {
                        method: 'GET',
                        signal: AbortSignal.timeout(3000)
                    });
                    
                    if (directResponse.ok) {
                        console.log('Motors stopped via direct control');
                        return;
                    }
                } catch (directError) {
                    console.log('Direct control failed for stop, using IoT Hub');
                }
            }
            
            // Fall back to IoT Hub control for stopping
            const response = await fetch('https://testdockerbackend.azurewebsites.net/api/control/stop-motors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ deviceId: 'doggoFetch' }),
            });
            
            if (!response.ok) {
                console.error('Failed to stop motors via IoT Hub');
            } else {
                console.log('Motors stopped via IoT Hub');
            }
        } catch (error) {
            console.error('Error stopping motors:', error);
        }
    };
    
    // Button text based on status
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
    
    // Button style based on status
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
    
    // Stop button classes
    const stopButtonClasses = "w-64 sm:w-80 font-medium rounded-lg text-sm px-5 py-2.5 bg-red-500 text-white hover:bg-red-700 transition-colors duration-300";
    
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
                
                {/* Stop Button */}
                <button
                    className={stopButtonClasses}
                    disabled={loading || error}
                    onClick={stopMotors}
                >
                    Emergency Stop
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
            
            {directControlEnabled && (
                <div className="mt-3 text-green-600 text-sm">
                    Direct control available for faster response
                </div>
            )}
        </div>
    );
}