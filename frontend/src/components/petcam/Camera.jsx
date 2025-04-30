import React, { useRef, useEffect, useState } from 'react';
import { Aperture, Video, StopCircle, Maximize2, Minimize2, Mic } from 'lucide-react';

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
    
    // Form data state (simplified for this example)
    const [formData, setFormData] = useState({
        pet_name: "pet"
    });
    
    // Pi Camera Stream URL - replace with your Raspberry Pi's IP address
    const [piCameraUrl, setPiCameraUrl] = useState('http://192.168.1.229:5000/video_feed');
    
    // Pi control endpoints
    const piControlUrl = 'http://192.168.1.229:5000';
    
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

    const handleMicToggle = () => {
        console.log('Mic toggled!');
        // Optional: Add speech-to-text logic or mic permissions here
    };


    // Function to capture photo from Pi camera stream with improved error handling
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
            

            const backendResponse = await fetch('http://localhost:3001/api/gallery/save-photo', {
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
            
            // Request the Pi to stop recording and get the video
            const response = await fetch(`${piControlUrl}/stop_recording`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to stop recording on Pi: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            // Try to save the recording to Azure if path exists
            if (result.video_path) {
                try {
                    await saveRecordingToAzure(result.video_path);
                } catch (saveError) {
                    console.error("Error saving to Azure:", saveError);
                    // Continue even if save to Azure fails - we still have local video
                }
            }
            
            setIsRecording(false);
            setIsSavingVideo(false);
            
            // If we have a video URL, store it
            if (result.video_url) {
                setSavedVideoUrl(result.video_url);
            }
            
        } catch (err) {
            console.error('Error stopping recording:', err);
            setError(`Failed to stop recording: ${err.message}`);
            setIsRecording(false);
            setIsSavingVideo(false);
        }
    };

    const saveRecordingToAzure = async (videoPath) => {
        try {
            // Get user ID from local storage
            const user_id = localStorage.getItem("user_id");
            if (!user_id) {
                throw new Error("User not logged in");
            }

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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            // Save the URL to state
            setSavedVideoUrl(result.video_url);
            alert('Video saved successfully! Check your gallery to view it.');
        } catch (err) {
            console.error('Error saving video:', err);
            setError(`Failed to save video: ${err.message}`);
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
        setPiCameraUrl(`http://192.168.1.229:5000/video_feed?cache=${Date.now()}`);
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

    return (
        <div className="text-black bg-very-bright-pastel-orange bg-cover bg-center min-h-screen items-center px-5 sm:px-20 py-8 font-montserrat">
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

                    <div className="mt-5 text-center">
                        <div className="mt-3 flex justify-center items-center flex-wrap gap-3 sm:gap-5">
                            {/* Start Fetch Button */}
                            <button
                            className="w-64 sm:w-80 text-black bg-bright-neon-yellow hover:bg-dark-grayish-orange focus:ring-4 hover:text-white focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
                            disabled={loading || error}
                            >
                            Start Fetch
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
                </div>

                
                <div className="mt-10 flex flex-col items-center">
                    <h1 className="font-semibold text-center mt-6 sm:mt-20 mb-5">
                        <p className="w-60 sm:w-72 md:w-80 h-20 text-2xl sm:text-3xl text-white bg-dark-grayish-orange focus:outline-none font-bold rounded-lg px-3 py-3 text-center">
                        {error ? "Not Available" : emotion}
                        </p>
                    </h1>
                
                    <div className="mt-6 bg-dark-grayish-orange w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg p-4">
                        <p className="text-white font-semibold text-base sm:text-lg mb-2 break-words">ScreenShot:</p>
                        <div className={`result ${hasPhoto ? 'hasPhoto' : ''}`}>
                            <canvas className="mt-5 ml-2" ref={photoRef}></canvas>

                            {hasPhoto && (
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
                                        className="w-full text-white bg-dark-pastel-orange hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}