import React, { useRef, useEffect, useState } from 'react';
import { Aperture, Video, StopCircle, Maximize2, Minimize2 } from 'lucide-react';
import EmotionDisplay from './EmotionDisplay';
import ControlButtons from './ControlButton';

export default function Camera() {
    const photoRef = useRef(null);
    const [hasPhoto, setHasPhoto] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [emotion, setEmotion] = useState('No Emotion Detected');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingFrame, setProcessingFrame] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedPhotoUrl, setSavedPhotoUrl] = useState(null);
    const [isSavingVideo, setIsSavingVideo] = useState(false);
    const [savedVideoUrl, setSavedVideoUrl] = useState(null);
    const [isVercelDeployment, setIsVercelDeployment] = useState(false);
    
    // Form data state (simplified for this example)
    const [formData, setFormData] = useState({
        pet_name: "pet"
    });

    // Check if we're running in HTTPS environment
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    
    // Allow user to set the Pi IP manually if needed
    const [piIpAddress, setPiIpAddress] = useState('192.168.1.140');
    
    // Set up URLs based on environment
    const [piCameraUrl, setPiCameraUrl] = useState(() => {
        if (isHttps) {
            // Use relative URL if we're in HTTPS to avoid mixed content
            return `/api/video-feed?cache=${Date.now()}`;
        } else {
            return `http://${piIpAddress}:5000/video_feed?cache=${Date.now()}`;
        }
    });
    
    const piControlUrl = isHttps 
        ? '/api' // Use relative URL for API calls in HTTPS
        : `http://${piIpAddress}:5000`;
    
    // Show warning if we're using HTTPS but don't have a proxy set up
    const [proxyWarning, setProxyWarning] = useState(false);
    
    useEffect(() => {
        if (isHttps) {
            // Always set proxy warning to true for Vercel deployment since we 
// know the proxy endpoints don't exist yet
            setProxyWarning(true);
        }
    }, [isHttps]);
    
    // Handle connecting issues
    useEffect(() => {
        // Set a timeout to check if the stream is loading
        const streamLoadTimeout = setTimeout(() => {
            const img = document.getElementById('pi-camera-stream');
            if (img && img.complete) {
                setLoading(false);
            }
        }, 3000);
        
        return () => clearTimeout(streamLoadTimeout);
    }, [piCameraUrl]);

    // Check connection status to Pi server
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await fetch(`${piControlUrl}/get_current_emotion`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 3000
                });
                
                if (response.ok) {
                    setError(null);
                } else {
                    setError("Pi server reachable but returning errors");
                }
            } catch (err) {
                console.error('Error checking Pi connection:', err);
                setError("Cannot connect to Pi server");
            }
        };
        
        checkConnection();
        
        // Set up a periodic connection check
        const intervalId = setInterval(checkConnection, 30000); // Check every 30 seconds
        
        return () => clearInterval(intervalId);
    }, [piControlUrl]);

    const handleMicToggle = () => {
        console.log('Mic toggled!');
    };

    const takePhoto = async () => {
        try {
            setProcessingFrame(true);
            
            // Request a photo capture from the Pi
            const response = await fetch(`${piControlUrl}/camera/capture_photo`, {
                method: 'POST',
                credentials: 'omit', // Don't send cookies
                headers: {
                    'Content-Type': 'application/json',
                },
                // Empty body but specified as JSON to avoid preflight issue
                body: JSON.stringify({})
            });
            
            if (!response.ok) {
                throw new Error(`Failed to capture photo: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            // Get photo data from response
            const photoData = result.photo;
            
            // Update emotion if available
            if (result.emotion) {
                setEmotion(`${result.emotion.class} (${result.emotion.confidence.toFixed(2)}%)`);
            }
            
            // Display the photo on canvas
            const photo = photoRef.current;
            const width = 314;
            const height = width / (16 / 9);
            photo.width = width;
            photo.height = height;
            
            const ctx = photo.getContext('2d');
            
            // Create a new image element to load the photo
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height);
                setHasPhoto(true);
                setProcessingFrame(false);
            };
            img.src = photoData;  // This is the base64 image from the Pi
            
        } catch (err) {
            console.error('Error taking photo:', err);
            setError(`Failed to take photo: ${err.message}`);
            setProcessingFrame(false);
        }
    };

    const closePhoto = () => {
        let photo = photoRef.current;
        let ctx = photo.getContext('2d');
        setHasPhoto(false);
        setSavedPhotoUrl(null);

        ctx.clearRect(0, 0, photo.width, photo.height);
    };

    const savePhotoToAzure = async () => {
        if (!hasPhoto) return;
        
        setIsSaving(true);
        try {
            // Get user ID from local storage
            const user_id = localStorage.getItem("user_id");
            if (!user_id) {
                throw new Error("User not logged in");
            }
            
            // Take and save the photo directly on the Pi
            const response = await fetch(`${piControlUrl}/camera/capture_photo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user_id,
                    pet_name: formData.pet_name || "pet",
                    emotion: emotion
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to save photo: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }
            

            const backendResponse = await fetch('https://testdockerbackend.azurewebsites.net/api/gallery/save-photo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user_id,
                    photo_data: result.photo,  // Use the photo data from the Pi
                    pet_name: formData.pet_name || "pet",
                    emotion: emotion,
                    filename: result.filename
                })
            });
            
            if (!backendResponse.ok) {
                throw new Error(`HTTP error! status: ${backendResponse.status}`);
            }
            
            const backendResult = await backendResponse.json();
            
            if (backendResult.error) {
                throw new Error(backendResult.error);
            }
            
            // Save the URL to state
            setSavedPhotoUrl(backendResult.photo_url); 
            setIsSaving(false);

        } catch (err) {
            console.error('Error saving photo:', err);
            setError(`Failed to save photo: ${err.message}`);
            setIsSaving(false);
        }
    };

    // Start recording from Pi camera stream
    const startRecording = async () => {
        try {
            setProcessingFrame(true);
            
            // Request the Pi to start recording
            const response = await fetch(`${piControlUrl}/start_recording`, {
                method: 'POST',
            });
            
            if (!response.ok) {
                throw new Error(`Failed to start recording on Pi: ${response.status}`);
            }
            
            setIsRecording(true);
            setError(null);
            
        } catch (err) {
            console.error('Error starting recording:', err);
            setError(`Failed to start recording: ${err.message}`);
        } finally {
            setProcessingFrame(false);
        }
    };

    const stopRecording = async () => {
        try {
            setIsSavingVideo(true);
            
            console.log("Stopping recording...");
            
            // Request the Pi to stop recording and get the video
            const response = await fetch(`${piControlUrl}/stop_recording`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Stop recording error response: ${errorText}`);
                throw new Error(`Failed to stop recording on Pi: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.error) {
                console.error("Stop recording result error:", result.error);
                throw new Error(result.error);
            }
            
            console.log("Recording stopped successfully:", result);
            
            // Try to save the recording to Azure if path exists
            if (result.video_path) {
                try {
                    console.log("Saving recording to Azure...");
                    await saveRecordingToAzure(result.video_path);
                } catch (saveError) {
                    console.error("Error saving to Azure:", saveError);
                    // Provide more feedback to user
                    setError(`Video saved locally but Azure upload failed: ${saveError.message}`);
                }
            } else {
                console.warn("No video path in result:", result);
                setError("Video recording stopped but no file path was returned");
            }
            
            setIsRecording(false);
            
            // If we have a video URL, store it
            if (result.video_url) {
                setSavedVideoUrl(result.video_url);
                console.log(`Video saved locally at: ${result.video_url}`);
            }
            
        } catch (err) {
            console.error('Error stopping recording:', err);
            setError(`Failed to stop recording: ${err.message}`);
            setIsRecording(false);
        } finally {
            setIsSavingVideo(false);
        }
    };

    const saveRecordingToAzure = async (videoPath) => {
        try {
            setIsSavingVideo(true);
            
            // Get user ID from local storage
            const user_id = localStorage.getItem("user_id");
            if (!user_id) {
                throw new Error("User not logged in");
            }

            console.log(`Attempting to transfer video: ${videoPath}`);
            
            // Request the Pi server to transfer the video to Azure
            const response = await fetch(`${piControlUrl}/transfer_video`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user_id,
                    video_path: videoPath,
                    pet_name: formData.pet_name || "pet"
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Transfer video error response: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            console.log("Video transfer successful:", result);
            
            // First, fetch the actual video file from the Pi server
            const videoFileUrl = `${piControlUrl}${result.video_url}`;
            console.log(`Fetching video file from: ${videoFileUrl}`);
            
            const videoResponse = await fetch(videoFileUrl);
            if (!videoResponse.ok) {
                throw new Error(`Failed to fetch video file from Pi: ${videoResponse.status}`);
            }
            
            // Convert to blob
            const videoBlob = await videoResponse.blob();
            console.log(`Video file fetched successfully, size: ${videoBlob.size} bytes`);
            
            // Check if the blob has data
            if (videoBlob.size === 0) {
                throw new Error("Video file is empty");
            }
            
            // Create a File object with proper MIME type
            const videoFile = new File([videoBlob], result.filename, { 
                type: 'video/mp4' 
            });
            
            // Create a FormData object to send the file
            const formDataObj = new FormData();
            formDataObj.append('user_id', user_id);
            formDataObj.append('pet_name', formData.pet_name || "pet");
            formDataObj.append('emotion', result.emotion || "Unknown");
            
            // Debug: Log what's being appended to video_file
            console.log(`Adding video file: ${videoFile.name}, size: ${videoFile.size}, type: ${videoFile.type}`);
            
            // Make sure we're using the expected field name that the backend is looking for
            formDataObj.append('video_file', videoFile);
            
            // Log the FormData entries for debugging
            for (let [key, value] of formDataObj.entries()) {
                console.log(`FormData Entry: ${key} = ${value instanceof File ? `File: ${value.name}, ${value.size} bytes` : value}`);
            }
            
            // Now upload to Azure via backend server with the actual file
            const backendResponse = await fetch('https://testdockerbackend.azurewebsites.net/api/camera/gallery/save-video', {
                method: 'POST',
                body: formDataObj 
            });
            
            if (!backendResponse.ok) {
                const errorText = await backendResponse.text();
                console.error(`Backend save video error: ${errorText}`);
                throw new Error(`Backend error! status: ${backendResponse.status}`);
            }
            
            const backendResult = await backendResponse.json();
            
            if (backendResult.error) {
                console.error("Backend result error:", backendResult.error);
                throw new Error(backendResult.error);
            }
            
            console.log("Video saved to Azure:", backendResult);
            
            // Save the URL to state
            setSavedVideoUrl(backendResult.video_url || result.video_url);
            alert('Video saved successfully! Check your gallery to view it.');
            
        } catch (err) {
            console.error('Error saving video:', err);
            setError(`Failed to save video: ${err.message}`);
            
            // Show a more detailed error dialog
            alert(`Video saving failed: ${err.message}. Please try again or check console for details.`);
        } finally {
            setIsSavingVideo(false);
        }
    };

    const toggleFullScreen = () => {
        const streamContainer = document.getElementById('pi-stream-container');

        if (!document.fullscreenElement) {
            if (streamContainer.requestFullscreen) {
                streamContainer.requestFullscreen();
            } else if (streamContainer.mozRequestFullScreen) { // Firefox
                streamContainer.mozRequestFullScreen();
            } else if (streamContainer.webkitRequestFullscreen) { // Chrome, Safari and Opera
                streamContainer.webkitRequestFullscreen();
            } else if (streamContainer.msRequestFullscreen) { // IE/Edge
                streamContainer.msRequestFullscreen();
            }
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
            setIsFullScreen(false);
        }
    };

    // Function to retry camera connection
    const retryCamera = () => {
        setError(null);
        setLoading(true);
        // Force reload by adding timestamp to URL
        if (isVercelDeployment || !isHttps) {
            setPiCameraUrl(`http://${piIpAddress}:5000/video_feed?cache=${Date.now()}`);
        } else {
            setPiCameraUrl(`/api/video-feed?ip=${piIpAddress}&cache=${Date.now()}`);
        }
    };
    
    // Handle image load error
    const handleImageError = () => {
        setLoading(false);
        setError("Cannot connect to Pi camera stream");
    };
    
    // Handle image load success
    const handleImageLoad = () => {
        setLoading(false);
        setError(null);
    };

    // Handle IP address change
    const handleIpChange = (e) => {
        setPiIpAddress(e.target.value);
    };
    
    // Update connection with new IP
    const updateConnection = () => {
        setError(null);
        setLoading(true);
        
        // Update URLs with new IP
        if (isVercelDeployment || !isHttps) {
            setPiCameraUrl(`http://${piIpAddress}:5000/video_feed?cache=${Date.now()}`);
        } else {
            setPiCameraUrl(`/api/video-feed?ip=${piIpAddress}&cache=${Date.now()}`);
        }
    };

    return (
        <div className="text-black bg-very-bright-pastel-orange bg-cover bg-center min-h-screen items-center px-5 sm:px-20 py-8 font-montserrat">
            {proxyWarning && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Connection Warning: </strong>
                    <span className="block sm:inline">
                        {isVercelDeployment ? 
                            "This app is hosted on Vercel and cannot directly connect to your Raspberry Pi camera. Please enter your Pi's IP address and ensure it's accessible from your network." :
                            "Your site is running on HTTPS but trying to access an HTTP camera feed. Set up a proxy server or use HTTPS on your Raspberry Pi."
                        }
                    </span>
                </div>
            )}
            
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Raspberry Pi IP Address:
                </label>
                <div className="flex flex-wrap">
                    <input
                        type="text"
                        value={piIpAddress}
                        onChange={handleIpChange}
                        className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2 mb-2 sm:mb-0"
                        placeholder="Enter your Pi's IP address"
                    />
                    <button 
                        onClick={updateConnection}
                        className="bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded px-4"
                    >
                        Connect
                    </button>
                </div>
                {isVercelDeployment && (
                    <p className="text-sm text-gray-600 mt-2">
                        Your Pi's IP must be accessible from your current network. 
                        This connection will only work on your local network.
                    </p>
                )}
            </div>

            <div className="justify flex flex-col lg:flex-row w-full overflow-x-hidden gap-7">
                <div className="relative inline-block mt-6 w-full ">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                            <button 
                                onClick={retryCamera} 
                                className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    
                    {loading && (
                        <div className="flex justify-center items-center h-40 mt-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark-pastel-orange"></div>
                            <p className="ml-3">Loading camera...</p>
                        </div>
                    )}
                    
                    <div id="pi-stream-container" className="relative w-full max-w-4xl aspect-video mx-auto mt-10 rounded-lg overflow-hidden shadow-md border border-gray-300">
                        {/* Use an img tag to display the MJPEG stream from the Pi */}
                        <img 
                            id="pi-camera-stream"
                            src={piCameraUrl}
                            className="w-full h-full object-cover rounded-lg border border-gray-300"
                            alt="Raspberry Pi Camera Stream"
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                        />

                        <button
                            onClick={toggleFullScreen}
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-2 sm:p-3 shadow-lg"
                            disabled={loading || error}
                        >
                            {isFullScreen ? (
                                <Minimize2 className="w-4 h-4 sm:w-6 sm:h-6" />
                            ) : (
                                <Maximize2 className="w-4 h-4 sm:w-6 sm:h-6" />
                            )}
                        </button>
                        
                        {/* Recording controls */}
                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                className="absolute bottom-2 sm:bottom-10 left-2 sm:left-4 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-2 sm:p-3 shadow-lg"
                                disabled={loading || error || processingFrame || isSavingVideo}
                            >
                                <Video className="w-4 h-4 sm:w-6 sm:h-6" />
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="absolute bottom-2 sm:bottom-10 left-2 sm:left-4 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-2 sm:p-3 shadow-lg"
                                disabled={isSavingVideo}
                            >
                                <StopCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                            </button>
                        )}

                        {isSavingVideo && (
                            <div className="absolute bottom-20 left-4 sm:left-16 ml-4 sm:ml-16 text-dark-pastel-orange font-medium">
                                Saving video...
                            </div>
                        )}
                        
                        <button
                            onClick={takePhoto}
                            className="absolute bottom-2 sm:bottom-10 left-10 sm:left-20 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-2 sm:p-3 shadow-lg"
                            disabled={loading || error || processingFrame}
                        >
                            <Aperture className='w-4 h-4 sm:w-6 sm:h-6' />
                        </button>
                        
                        {processingFrame && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>

                    <ControlButtons 
                        loading={loading} 
                        error={error} 
                        handleMicToggle={handleMicToggle} 
                    />
                </div>

                {/* Emotion Display Component */}
                <EmotionDisplay 
                    error={error}
                    emotion={emotion}
                    hasPhoto={hasPhoto}
                    photoRef={photoRef}
                    savePhotoToAzure={savePhotoToAzure}
                    isSaving={isSaving}
                    savedPhotoUrl={savedPhotoUrl}
                    closePhoto={closePhoto}
                />
            </div>
        </div>
    );
}