import React, { useRef, useEffect, useState } from 'react';
import { Aperture, ZoomIn, ZoomOut, Video, StopCircle, Maximize2, Minimize2 } from 'lucide-react';

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
                }),
                timeoutPromise
            ]);

            let video = videoRef.current;
            if (!video) return; // Guard against component unmount

            video.srcObject = stream;
            video.play();

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

        // Flip the canvas to match the flipped video
        ctx.translate(width, 0);
        ctx.scale(-1, 1);

        ctx.drawImage(video, 0, 0, width, height);
        setHasPhoto(true);
    };

    const closePhoto = () => {
        let photo = photoRef.current;
        let ctx = photo.getContext('2d');
        setHasPhoto(false);

        ctx.clearRect(0, 0, photo.width, photo.height);
    };

    const startRecording = () => {
        try {
            const stream = videoRef.current.srcObject;
            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (event) => {
                chunks.current.push(event.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'video/mp4' });
                chunks.current = [];
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'recorded-video.mp4';
                a.click();
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
            if (track) {
                track.stop();
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
            
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('User details fetch timed out')), 5000);
            });
            
            try {
                const response = await Promise.race([
                    fetch(`http://localhost:3001/api/user-details?user_id=${user_id}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        mode: "cors",
                    }),
                    timeoutPromise
                ]);
                
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
                    
                    <video
                        ref={videoRef}
                        className="transform scale-x-[-1] rounded-lg border border-gray-300 shadow-md mt-10 justify-center"
                    ></video>

                    <button
                        onClick={toggleFullScreen}
                        className="absolute top-2 sm:top-12 right-2 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-3 shadow-lg"
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
                        className="absolute bottom-32 sm:bottom-40 right-2 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-3 shadow-lg"
                        disabled={loading || error || !track}
                    >
                        <ZoomIn className='w-4 h-4 sm:w-6 sm:h-6' />
                    </button>
                    <button
                        onClick={() => handleZoom('out')}
                        className="absolute bottom-20 sm:bottom-24 right-2 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-3 shadow-lg"
                        disabled={loading || error || !track}
                    >
                        <ZoomOut className='w-4 h-4 sm:w-6 sm:h-6' />
                    </button>

                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            className="absolute bottom-20 left-16 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-3 shadow-lg mb-5 -ml-12"
                            disabled={loading || error || !track}
                        >
                            <Video className="w-4 h-4 sm:w-6 sm:h-6" />
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="absolute bottom-20 left-16 bg-red-600 text-white hover:bg-red-800 focus:ring-4 focus:outline-none font-medium rounded-full p-3 shadow-lg mb-5 -ml-12"
                        >
                            <StopCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                        </button>
                    )}

                    <button
                        onClick={takePhoto}
                        className="absolute bottom-20 left-16 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-3 shadow-lg mb-5 ml-1"
                        disabled={loading || error || !track}
                    >
                        <Aperture className='w-4 h-4 sm:w-6 sm:h-6' />
                    </button>

                    <div className="mt-5 text-center">
                        <h1>Play with <b>{formData.pet_name || "your pet"} </b></h1>
                        <button
                            className="w-80 text-black bg-bright-neon-yellow hover:bg-dark-grayish-orange focus:ring-4 hover:text-white focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
                            disabled={loading || error}
                        >
                            Start Fetch
                        </button>
                    </div>
                    
                </div>

                <div className="mt-10 flex flex-col items-center">
                    <h1 className="font-semibold text-center mt-20 mb-5">CURRENT EMOTION:  
                        <p className="w-60 h-20 text-2xl text-white bg-dark-grayish-orange focus:outline-none font-bold rounded-lg px-3 py-3 text-center">
                            {error ? "Not Available" : emotion}
                        </p>
                    </h1>
                    
                    <div className="mt-6 bg-dark-grayish-orange w-80 h-50 rounded-lg p-3">
                        <p className="text-white font-semibold">ScreenShot:</p>
                        <div className={`result ${hasPhoto ? 'hasPhoto' : ''}`}>
                            <canvas className="mt-5 ml-2" ref={photoRef}></canvas>

                            {hasPhoto && (
                                <button
                                    onClick={closePhoto}
                                    className="lg:w-full w-80 text-white bg-dark-pastel-orange hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}