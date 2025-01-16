import React, { useState } from 'react';
import VideoModal from './VideoModal';
import { useNavigate } from 'react-router-dom';

const Gallery = () => {
  const navigate = useNavigate(); // Move useNavigate inside the component
  const [selectedVideo, setSelectedVideo] = useState(null);

  const videos = [
    { id: 1, title: 'Dog Emotion', date: '2022-01-01', url: 'https://www.youtube.com/embed/example1', shape: 'rectangle' },
    { id: 2, title: 'Dog Emotion', date: '2022-02-01', url: 'https://www.youtube.com/embed/example2', shape: 'square' },
    { id: 3, title: 'Dog Emotion', date: '2022-03-01', url: 'https://www.youtube.com/embed/example3', shape: 'square' },
    { id: 4, title: 'Dog Emotion', date: '2022-04-01', url: 'https://www.youtube.com/embed/example4', shape: 'rectangle' },
  ];

  const handleDashboardButtonClick = () => {
    navigate('/dashboard-page'); // Redirect to the Dashboard page
  };

  const handlePetCamButtonClick = () => {
    navigate('/petcam-page'); // Redirect to the PetCam page
  };

  return (
    <div id="home"
    className='text-black bg-very-bright-pastel-orange bg-cover bg-center min-h-screen items-center px-20 py-8 font-montserrat '
    >
      {/* Buttons */}
      <div className=" font-semibold text-center">
      <button
        onClick={handleDashboardButtonClick}
        className="absolute top-4 left-4 bg-dark-grayish-orange text-white px-4 py-2 rounded hover:bg-yellow mt-20"
      >
        Your Dog's Emotion
      </button>

      <button
        onClick={handlePetCamButtonClick}
        className="absolute top-4 right-4 bg-dark-grayish-orange text-white px-4 py-2 rounded hover:bg-yellow mt-20"
      >
        See Your Dog
      </button>
      </div>

      {/* Logo Section */}
      <div className="flex justify-center mt-20 ">
        <img src="/public/logo.png" alt="Logo" className="w-25 h-20" />
      </div>

      {/* Gallery Grid */}
      <div className="pt-12 grid grid-cols-2 gap-8">
        {videos.map((video) => (
          <div
            key={video.id}
            className={`bg-white shadow-lg p-4 rounded cursor-pointer ${
              video.shape === 'rectangle' ? 'col-span-2' : 'col-span-1'
            }`}
            onClick={() => setSelectedVideo(video)}
          >
            {/* Video Thumbnail */}
            <div
              className={`bg-gray-300 rounded flex items-center justify-center ${
                video.shape === 'rectangle' ? 'w-full h-48' : 'w-full h-48'
              }`}
            >
              <button className="text-4xl hover:text-yellow hover:transition duration-300">▶</button>
            </div>

            {/* Video Information */}
            <div className="mt-2 text-left">
              <h3 className="text-lg font-semibold">{video.title}</h3>
              <p className="text-sm text-gray-500">Your Title</p>
              <p className="text-sm text-gray-500">{video.date}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-12 grid grid-cols-2 gap-8">
        {videos.map((video) => (
          <div
            key={video.id}
            className={`bg-white shadow-lg p-4 rounded cursor-pointer ${
              video.shape === 'rectangle' ? 'col-span-2' : 'col-span-1'
            }`}
            onClick={() => setSelectedVideo(video)}
          >
            {/* Video Thumbnail */}
            <div
              className={`bg-gray-300 rounded flex items-center justify-center ${
                video.shape === 'rectangle' ? 'w-full h-48' : 'w-full h-48'
              }`}
            >
              <button className="text-4xl hover:text-yellow hover:transition duration-300">▶</button>
            </div>

            {/* Video Information */}
            <div className="mt-2 text-left">
              <h3 className="text-lg font-semibold">{video.title}</h3>
              <p className="text-sm text-gray-500">Your Title</p>
              <p className="text-sm text-gray-500">{video.date}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
    </div>
  );
};

export default Gallery;
