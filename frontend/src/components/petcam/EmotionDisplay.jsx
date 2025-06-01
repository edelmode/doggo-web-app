import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function EmotionDisplay({ 
    error, 
    emotion, 
    hasPhoto, 
    photoRef, 
    savePhotoToAzure, 
    isSaving, 
    savedPhotoUrl, 
    closePhoto 
}) {
    const [socketEmotion, setSocketEmotion] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [connectionAttempts, setConnectionAttempts] = useState(0);
    const [usingPolling, setUsingPolling] = useState(false);
    const [debugMsg, setDebugMsg] = useState('Initializing...');
    const [pollingSuccess, setPollingSuccess] = useState(false);
    const [noDogDetected, setNoDogDetected] = useState(false);
    const [lastRecordedEmotion, setLastRecordedEmotion] = useState(null);
    const [lastRecordedDate, setLastRecordedDate] = useState(null);

    // Configuration with environment-specific settings
    const CONFIG = {
        // Replace with your actual backend URL or use environment variables
        socketUrl: 'https://raspberrypi.tail58fb54.ts.net',
        pollingEndpoint: '/get_current_emotion',
        maxSocketAttempts: 3,
        socketTimeout: 5000, // 5 seconds
        pollingInterval: 1000, // 1 second
        socketRetryInterval: 30000, // 30 seconds
        // Removed emotionRecordInterval as we want to record each detection
    };

    // Connect to Socket.IO server when component mounts
    useEffect(() => {
        // Only attempt socket connection if we haven't exceeded max attempts
        if (connectionAttempts < CONFIG.maxSocketAttempts) {
            const debugMessage = `Attempting Socket.IO connection #${connectionAttempts + 1}...`;
            console.log(debugMessage);
            setDebugMsg(debugMessage);
            
            const newSocket = io(CONFIG.socketUrl, {
                reconnectionAttempts: 3,
                reconnectionDelay: 1000,
                autoConnect: true,
                timeout: CONFIG.socketTimeout,
                transports: ['websocket', 'polling'] // Try websocket first, then polling
            });

            // Socket event handlers
            newSocket.on('connect', () => {
                const successMsg = 'Socket.IO connected successfully!';
                console.log(successMsg);
                setDebugMsg(successMsg);
                setIsConnected(true);
                setUsingPolling(false);
                
                // Subscribe to emotion updates
                newSocket.emit('subscribe_to_emotions');
            });

            newSocket.on('disconnect', () => {
                console.log('Socket.IO disconnected');
                setDebugMsg('Socket.IO disconnected');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (err) => {
                const errorMsg = `Socket.IO connection error: ${err.message}`;
                console.error(errorMsg);
                setDebugMsg(errorMsg);
                setIsConnected(false);
                setConnectionAttempts(prev => prev + 1);
            });

            // Listen for emotion updates
            newSocket.on('emotion_update', (data) => {
                console.log('Received emotion update:', data);
                
                // Handle "no detection" status 
                if (data.status === 'no_detection' || data.emotion === null) {
                    setSocketEmotion(null);
                    setNoDogDetected(true);
                    setDebugMsg('No dog detected');
                } else {
                    setNoDogDetected(false);
                    const emotionData = {
                        class: data.emotion,
                        confidence: data.confidence,
                        age: data.age
                    };
                    setSocketEmotion(emotionData);
                    
                    // Record emotion to database every time a new emotion is detected
                    recordEmotionToDatabase(emotionData);
                }
                setLastUpdated(new Date());
            });

            setSocket(newSocket);

            // Clean up on unmount or when we switch to polling
            return () => {
                if (newSocket) {
                    console.log('Cleaning up socket connection');
                    newSocket.emit('unsubscribe_from_emotions');
                    newSocket.disconnect();
                }
            };
        } else {
            // Switch to polling if socket connections fail
            const pollingMsg = 'Max socket connection attempts reached, using polling fallback';
            setUsingPolling(true);
            setDebugMsg(pollingMsg);
            console.log(pollingMsg);
            return () => {}; // No cleanup needed
        }
    }, [connectionAttempts]); // Dependency on connectionAttempts will recreate socket when attempts changes

    // HTTP polling fallback with improved error handling
    useEffect(() => {
        let pollingInterval;
        
        // Only poll if socket is not connected or we've explicitly switched to polling
        if ((!isConnected || usingPolling) && !pollingInterval) {
            console.log('Starting HTTP polling for emotion updates');
            setDebugMsg('Starting HTTP polling for emotion updates');
            
            pollingInterval = setInterval(async () => {
                try {
                    const response = await fetch(`${CONFIG.socketUrl}${CONFIG.pollingEndpoint}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data.status === 'success') {
                        setNoDogDetected(false);
                        const emotionData = {
                            class: data.emotion.class,
                            confidence: data.emotion.confidence,
                            age: data.emotion.age
                        };
                        setSocketEmotion(emotionData);
                        
                        // Record emotion to database every time a new emotion is detected
                        recordEmotionToDatabase(emotionData);
                        
                        setLastUpdated(new Date());
                        setPollingSuccess(true);
                        
                        if (!pollingSuccess) {
                            setDebugMsg('Polling connection successful');
                        }
                    } else if (data.status === 'stale') {
                        setDebugMsg(`Polling: ${data.message}`);
                        // If data is stale for too long, consider clearing the emotion
                        if (data.emotion === null || data.age > 5.0) {
                            setSocketEmotion(null);
                            setNoDogDetected(true);
                        }
                    } else if (data.status === 'no_detection') {
                        setDebugMsg(`Polling: ${data.message}`);
                        setSocketEmotion(null);
                        setNoDogDetected(true);
                    }
                } catch (err) {
                    console.error('Error polling for emotion:', err);
                    setDebugMsg(`Polling error: ${err.message}`);
                    setPollingSuccess(false);
                }
            }, CONFIG.pollingInterval);
        }

        return () => {
            if (pollingInterval) {
                console.log('Stopping polling interval');
                clearInterval(pollingInterval);
            }
        };
    }, [isConnected, usingPolling, pollingSuccess]);

    // Reset connection attempts after a longer period to try socket again
    useEffect(() => {
        let resetTimer;
        
        if (usingPolling) {
            const resetMsg = `Will try WebSocket again in ${CONFIG.socketRetryInterval/1000} seconds`;
            setDebugMsg(prev => pollingSuccess ? `${prev}. ${resetMsg}` : resetMsg);
            
            resetTimer = setTimeout(() => {
                setConnectionAttempts(0);
                setUsingPolling(false);
                console.log('Resetting connection attempts to try socket again');
            }, CONFIG.socketRetryInterval);
        }
        
        return () => {
            if (resetTimer) clearTimeout(resetTimer);
        };
    }, [usingPolling, pollingSuccess]);

    // Updated function to record emotion to database - Record every detection
    const recordEmotionToDatabase = async (emotionData) => {
        if (!emotionData || !emotionData.class) {
            return;
        }

        try {
            // Get the user ID from localStorage
            const userId = localStorage.getItem('user_id');
            
            if (!userId) {
                console.error('User ID not found in localStorage');
                return;
            }

            // Current datetime for debugging/display
            const now = new Date();
            const formattedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            console.log('Recording emotion to database:', {
                emotion: emotionData.class,
                confidence: emotionData.confidence,
                userId: userId,
                date: formattedDate
            });
            
            // Log the payload for debugging
            const payload = {
                user_id: parseInt(userId), // Convert to number in case it's stored as string
                emotion: emotionData.class,
                confidence: parseFloat(emotionData.confidence) // Ensure it's a number
            };
            console.log('Sending payload to server:', payload);
            
            const response = await fetch('https://testdockerbackend.azurewebsites.net/api/dashboard/save-emotion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Emotion recorded to database:', result);

            setLastRecordedEmotion({
                ...emotionData,
                timestamp: Date.now()
            });
            
            setLastRecordedDate(formattedDate);

        } catch (error) {
            console.error('Error recording emotion to database:', error);
        }
    };

    // Determine which emotion to display (socket emotion has priority if available)
    const displayEmotion = socketEmotion ? 
        `${socketEmotion.class} (${socketEmotion.confidence.toFixed(2)}%)` : 
        noDogDetected ? "No dog detected" : emotion;

    // Get appropriate background color based on emotion
    const getEmotionColor = (emotionText) => {
        if (!emotionText || typeof emotionText !== 'string') return 'bg-gray-500';
        
        const lowerEmotion = emotionText.toLowerCase();
        
        if (lowerEmotion.includes('happy')) return 'bg-green-500';
        if (lowerEmotion.includes('relaxed')) return 'bg-yellow-500';
        if (lowerEmotion.includes('angry')) return 'bg-red-600';
        if (lowerEmotion.includes('fear')) return 'bg-blue-600';
        if (lowerEmotion.includes('no dog')) return 'bg-gray-500';
        return 'bg-gray-500'; // default
    };

    const emotionColor = socketEmotion ? getEmotionColor(socketEmotion.class) : noDogDetected ? 'bg-gray-500' : getEmotionColor(emotion);

    useEffect(() => {
        if (socketEmotion?.class?.toLowerCase() === 'anger') {
            const audio = document.getElementById("alert-sound");
            if (audio) {
                audio.play().catch(err => {
                    console.warn('Autoplay prevented:', err);
                });
            }
            alert("⚠️ Anger emotion detected!");
        }
    }, [socketEmotion]);


    return (
        <div className="mt-10 flex flex-col items-center sm:items-end">
            <audio id="alert-sound" src="/alert.mp3" preload="auto"></audio>

            <div className="font-semibold text-center mt-6 sm:mt-20 mb-5">
                <div className={`w-60 sm:w-72 md:w-80 text-2xl sm:text-3xl text-white ${emotionColor} focus:outline-none font-bold rounded-lg px-3 py-3 text-center transition-colors duration-300`}>
                    {error ? "Not Available" : displayEmotion}
                </div>
                
                {/* Connection status indicator */}
                <div className="mt-2 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : usingPolling && pollingSuccess ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-600">
                        {isConnected ? 'Real-time connection active' : 
                         usingPolling && pollingSuccess ? 'Using HTTP polling fallback' : 
                         'Attempting to connect...'}
                    </span>
                </div>
                
                {/* Debug message */}
                <div className="text-xs text-gray-600 mt-1 px-4">
                    {debugMsg}
                </div>
                
                {/* Last updated timestamp */}
                {lastUpdated && (
                    <div className="text-xs text-gray-500 mt-1">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                )}
                
                {/* Emotion recording status */}
                {lastRecordedEmotion && (
                    <div className="text-xs text-gray-500 mt-1">
                        Last recorded: {lastRecordedEmotion.class} at {new Date(lastRecordedEmotion.timestamp).toLocaleTimeString()}
                        {lastRecordedDate && <span> on {lastRecordedDate}</span>}
                    </div>
                )}
            </div>
        
            {/* Always render the canvas but keep it hidden when there's no photo */}
            <div className={`mt-6 bg-gray-700 w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg p-4 ${!hasPhoto ? 'hidden' : ''}`}>
                <p className="text-white font-semibold text-base sm:text-lg mb-2 break-words">ScreenShot:</p>
                <div className="result hasPhoto">
                    <canvas className="mt-5 ml-2" ref={photoRef}></canvas>

                    <div className="flex flex-col gap-2 mt-2">
                        <button
                            onClick={savePhotoToAzure}
                            className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            disabled={isSaving || savedPhotoUrl}
                        >
                            {isSaving ? 'Saving...' : savedPhotoUrl ? 'Saved!' : 'Save Photo'}
                        </button>
                        <button
                            onClick={closePhoto}
                            className="w-full text-white bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}