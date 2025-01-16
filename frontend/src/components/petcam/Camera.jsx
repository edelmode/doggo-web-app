import React, { useRef, useEffect, useState } from 'react';
import { Aperture, ZoomIn, ZoomOut } from 'lucide-react';

export default function Camera() {
    const videoRef = useRef(null);
    const photoRef = useRef(null);
    const [hasPhoto, setHasPhoto] = useState(false);
    const [track, setTrack] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [userDetails, setUserDetails] = useState(null);
    const [formData, setFormData] = useState({
        pet_name: "",
    });

    useEffect(() => {
        const fetchUserDetails = async () => {
            const user_id = localStorage.getItem("user_id");
        
            if (!user_id) {
                setError("User not logged in");
                setLoading(false);
                return;
            }
        
            try {
                const response = await fetch(`http://localhost:3001/api/user-details?user_id=${user_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                mode: "cors",
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
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };
    
        fetchUserDetails();
    }, []);

    const getVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1080, height: 580 },
            });

            let video = videoRef.current;
            video.srcObject = stream;
            video.play();

            const videoTrack = stream.getVideoTracks()[0];
            setTrack(videoTrack);

            const capabilities = videoTrack.getCapabilities();
            if (capabilities.zoom) {
                const settings = videoTrack.getSettings();
                setZoomLevel(settings.zoom || 1); // Default to current zoom
            }
        } catch (err) {
            console.error(err);
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

    useEffect(() => {
        getVideo();
    }, []);

    return (
        <div
            className="text-black bg-very-bright-pastel-orange bg-cover bg-center min-h-screen items-center px-20 py-8 font-montserrat"
        >
            <div className="justify flex flex-col lg:flex-row w-full overflow-x-hidden gap-7">
                <div className="relative inline-block mt-6 w-full">
                    <video
                        ref={videoRef}
                        className="transform scale-x-[-1] rounded-lg border border-gray-300 shadow-md mt-10 justify-center"
                    ></video>

                    <button
                        onClick={() => handleZoom('in')}
                        className="absolute bottom-32 sm:bottom-40 right-2 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-3 shadow-lg"
                    >
                        <ZoomIn className='w-4 h-4 sm:w-6 sm:h-6'/>
                    </button>
                    <button
                        onClick={() => handleZoom('out')}
                        className="absolute bottom-20 sm:bottom-24 right-2 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-3 shadow-lg"
                    >
                        <ZoomOut className='w-4 h-4 sm:w-6 sm:h-6' />
                    </button>

                    <button
                        onClick={takePhoto}
                        className="absolute bottom-2 right-2 bg-dark-pastel-orange text-white hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-full p-3 shadow-lg"
                    >
                        <Aperture className='w-4 h-4 sm:w-6 sm:h-6' />
                    </button>
                </div>
                </div>
                
            
                <div className="mt-6 ">
                    <div className="mt-6">
                        <p >CURRENT EMOTION:</p>
                        <h2
                            className=" w-80 h-20 text-3xl text-white bg-dark-grayish-orange focus:outline-none font-medium rounded-lg px-5 py-1"
                        >
                            No Emotion Detected
                        </h2>
                    </div>

                    <div className="mt-6 text-center">
                        <h1>PLAY WITH {formData.pet_name}</h1>
                        <button
                            className="lg:w-[100%] w-50 text-black bg-bright-neon-yellow hover:bg-dark-grayish-orange focus:ring-4
                            hover:text-white focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
                        >
                            Start Fetch
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <div className={`result ${hasPhoto ? 'hasPhoto' : ''}`}>
                            <canvas className="mt-6" ref={photoRef}></canvas>

                            {hasPhoto && (
                                <button
                                    onClick={closePhoto}
                                    className="lg:w-full w-80 text-white bg-dark-pastel-orange hover:bg-dark-grayish-orange focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        
    );
}
