import React, { useState } from 'react';
import VideoModal from './VideoModal';

const Gallery = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const videos = [
    { id: 1, title: 'Dog Emotion', date: '2022-01-01', url: 'https://www.youtube.com/embed/example1', shape: 'rectangle' },
    { id: 2, title: 'Dog Emotion', date: '2022-02-01', url: 'https://www.youtube.com/embed/example2', shape: 'square' },
    { id: 3, title: 'Dog Emotion', date: '2022-03-01', url: 'https://www.youtube.com/embed/example3', shape: 'square' },
    { id: 4, title: 'Dog Emotion', date: '2022-04-01', url: 'https://www.youtube.com/embed/example4', shape: 'rectangle' },
  ];

  const handleButtonClick = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="relative p-5" style={{backgroundColor: '#F4ECE1'}}>
      <button
        onClick={handleButtonClick}
        className="absolute top-4 left-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400"
      >
        Your Dog's Emotion
      </button>

      {/* "DOGGO GALLERY" Text */}
      <h1 className="text-center text-2xl font-bold mt-12">DOGGO GALLERY</h1>

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
              <button className="text-4xl">▶</button>
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
