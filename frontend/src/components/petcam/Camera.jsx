import React, { useRef, useEffect, useState } from 'react';
import { Aperture, ZoomIn, ZoomOut, Video, StopCircle, Maximize2, Minimize2, Mic } from 'lucide-react';
import ManualModal from './manualModal';


export default function Camera() {
    const videoRef = useRef(null);
    const photoRef = useRef(null);
    const [hasPhoto, setHasPhoto] = useState(false);
    const [track, setTrack] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [emotion, setEmotion] = useState('No Emotion Detected');
    const chunks = useRef([]);
    const [userDetails, setUserDetails] = useState(null);
    const [formData, setFormData] = useState({
        pet_name: "",
    });
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [savedPhotoUrl, setSavedPhotoUrl] = useState(null);
    const [isSavingVideo, setIsSavingVideo] = useState(false);
    const [savedVideoUrl, setSavedVideoUrl] = useState(null);
    const [stream, setStream] = useState(null); // Added state to store the media stream

    const handleMicToggle = () => {
        console.log('Mic toggled!');
        // Optional: Add speech-to-text logic or mic permissions here
    };

    const getVideo = async () => {
        // Create a timeout promise that rejects after 10 seconds
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Camera access timed out. Please try again.')), 10000);
        });

        try {
            // Race between getting the camera and the timeout
            const stream = await Promise.race([
                navigator.mediaDevices.getUserMedia({
                    video: { width: 1080, height: 580 },
                    audio: true, // Enable audio for recordings
                }),
                timeoutPromise
            ]);

            let video = videoRef.current;
            if (!video) return; // Guard against component unmount

            // Set the stream as the video source
            video.srcObject = stream;
            video.play(); // Make sure video starts playing

            // Store the stream in state for later use
            setStream(stream);

            const videoTrack = stream.getVideoTracks()[0];
            setTrack(videoTrack);

            const capabilities = videoTrack.getCapabilities();
            if (capabilities.zoom) {
                const settings = videoTrack.getSettings();
                setZoomLevel(settings.zoom || 1); // Default to current zoom
            }
            
            setError(null);
        } catch (err) {
            console.error(err);
            setError(`Failed to access camera: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleZoom = async (direction) => {
        if (!track) return;

        const capabilities = track.getCapabilities();
        if (!capabilities.zoom) {
            alert('This camera does not support zoom.');
            return;
        }

        const { min, max } = capabilities.zoom;
        let newZoom = zoomLevel;

        if (direction === 'in') {
            newZoom = Math.min(zoomLevel + 0.5, max);
        } else if (direction === 'out') {
            newZoom = Math.max(zoomLevel - 0.5, min);
        }

        try {
            await track.applyConstraints({ advanced: [{ zoom: newZoom }] });
            setZoomLevel(newZoom);
        } catch (err) {
            console.error('Error applying zoom:', err);
            setError(`Failed to adjust zoom: ${err.message}`);
        }
    };

    const takePhoto = () => {
        const width = 314;
        const height = width / (16 / 9);

        let video = videoRef.current;
        let photo = photoRef.current;

        photo.width = width;
        photo.height = height;

        let ctx = photo.getContext('2d');

        ctx.drawImage(video, 0, 0, width, height);
        setHasPhoto(true);
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
            // Get the canvas data
            const photo = photoRef.current;
            const photoData = photo.toDataURL('image/jpeg');
            
            // Get user ID from local storage
            const user_id = localStorage.getItem("user_id");
            if (!user_id) {
                throw new Error("User not logged in");
            }
            
            // Prepare data for the server
            const data = {
                user_id: user_id,
                photo_data: photoData,
                pet_name: formData.pet_name || "pet",
                emotion: emotion
            };
            
            // Send to Flask backend
            const response = await fetch('http://localhost:3001/api/gallery/save-photo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            // Save the URL to state
            setSavedPhotoUrl(result.photo_url);
        } catch (err) {
            console.error('Error saving photo:', err);
            setError(`Failed to save photo: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const startRecording = () => {
        try {
            if (!stream) {
                throw new Error('No media stream available');
            }
            
            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            
            chunks.current = []; // Reset chunks
            
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                // Instead of downloading, we'll upload to Azure
                await saveRecordingToAzure();
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setError(null);
        } catch (err) {
            console.error('Error starting recording:', err);
            setError(`Failed to start recording: ${err.message}`);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            try {
                mediaRecorder.stop();
                setIsRecording(false);
            } catch (err) {
                console.error('Error stopping recording:', err);
                setError(`Failed to stop recording: ${err.message}`);
            }
        }
    };

    const saveRecordingToAzure = async () => {
        setIsSavingVideo(true);
        try {
            // Get user ID from local storage
            const user_id = localStorage.getItem("user_id");
            if (!user_id) {
                throw new Error("User not logged in");
            }

            // Create FormData to send video file
            const formData = new FormData();
            const blob = new Blob(chunks.current, { type: 'video/webm' });
            formData.append('video', blob, `pet_video_${Date.now()}.webm`);
            formData.append('user_id', user_id);
            formData.append('pet_name', formData.pet_name || "pet");
            
            // Send to Flask backend
            const response = await fetch('http://localhost:3001/api/gallery/save-video', {
                method: 'POST',
                body: formData
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


    const detectEmotion = () => {
        // Simulating emotion detection
        const emotions = ['Happy', 'Sad', 'Surprised', 'Angry', 'No Emotion Detected'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        setEmotion(randomEmotion);
    };

    useEffect(() => {
        const initCamera = async () => {
            setLoading(true);
            await getVideo();
        };
        
        initCamera();
        const emotionInterval = setInterval(detectEmotion, 2000); // Simulate emotion detection every 2 seconds
        
        return () => {
            clearInterval(emotionInterval);
            // Clean up any tracks when component unmounts
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        const fetchUserDetails = async () => {
            const user_id = localStorage.getItem("user_id");
            
            if (!user_id) {
                setError("User not logged in");
                setLoading(false);
                return;
            }
            
            try {
                const response = await fetch(`http://localhost:3001/api/user/user-details?user_id=${user_id}`, {
                    method: "GET",
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }
                
                setUserDetails(data);
                setFormData({
                    pet_name: data.pet_name,
                });
                setError(null);
            } catch (error) {
                console.error('Error fetching user details:', error);
                setError(`Failed to load user details: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserDetails();
    }, []);

    const toggleFullScreen = () => {
        const videoElement = videoRef.current;

        if (!document.fullscreenElement) {
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            } else if (videoElement.mozRequestFullScreen) { // Firefox
                videoElement.mozRequestFullScreen();
            } else if (videoElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
                videoElement.webkitRequestFullscreen();
            } else if (videoElement.msRequestFullscreen) { // IE/Edge
                videoElement.msRequestFullscreen();
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

    // Function to retry camera access if it failed
    const retryCamera = () => {
        setError(null);
        setLoading(true);
        getVideo();
    };

    const [showManualModal, setShowManualModal] = useState(true); // Show by default

    const videoUrls = [
    "/public/DOGGO1.mp4",
    "/public/DOGGO2.mp4",
    "/public/DOGGO3.mp4",
    "/public/DOGGO4.mp4",
    "/public/DOGGO5.mp4",
    ];


    return (
        <div className="text-black bg-very-bright-pastel-orange bg-cover bg-center min-h-screen items-center px-20 py-8 font-montserrat">
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
                    
                    <div className="relative w-full max-w-4xl aspect-video mx-auto mt-10 rounded-lg overflow-hidden shadow-md border border-gray-300">

                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover transform scale-x-[-1] rounded-lg border border-gray-300"
                            autoPlay
                            playsInline
                            muted
                        ></video>

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
                    
                        <button
                            onClick={() => handleZoom('in')}
                            className="absolute bottom-10 sm:bottom-28 right-2 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-2 sm:p-3 shadow-lg"
                            disabled={loading || error || !track}
                        >
                            <ZoomIn className='w-4 h-4 sm:w-6 sm:h-6' />
                        </button>
                        
                        <button
                            onClick={() => handleZoom('out')}
                            className="absolute bottom-2 sm:bottom-12 right-2 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-2 sm:p-3 shadow-lg"
                            disabled={loading || error || !track}
                        >
                            <ZoomOut className='w-4 h-4 sm:w-6 sm:h-6' />
                        </button>

                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                className="absolute bottom-2 sm:bottom-10 left-2 sm:left-4 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-2 sm:p-3 shadow-lg"
                                disabled={loading || error || !stream || isSavingVideo}
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
                            <div className="absolute bottom-20 left-16 ml-16 text-dark-pastel-orange font-medium">
                                Saving video...
                            </div>
                        )}

                        <button
                            onClick={takePhoto}
                            className="absolute bottom-2 sm:bottom-10 left-10 sm:left-20 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-2 sm:p-3 shadow-lg"
                            disabled={loading || error || !track}
                        >
                            <Aperture className='w-4 h-4 sm:w-6 sm:h-6' />
                        </button>
                    </div>

                    <div className="mt-5 text-center">
                        <h1>
                            Play with <b>{formData.pet_name || "your pet"} </b>
                        </h1>

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
                    <h1 className="font-semibold text-center mt-20 mb-5">
                        CURRENT EMOTION:  
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
            <ManualModal 
  isOpen={showManualModal}
  onClose={() => setShowManualModal(false)}
  videos={videoUrls}
/>

        </div>
    );
}