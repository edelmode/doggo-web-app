import React from 'react';

const VideoModal = ({ video, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg max-w-xl w-full relative">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>✕</button>
        <iframe
          src={video.url}
          title="Dog Emotion Video"
          className="w-full h-64 rounded-lg"
          allowFullScreen
        ></iframe>
        <h3 className="text-lg font-semibold mt-2">{video.title}</h3>
        <p className="text-sm text-gray-500">{video.date}</p>
      </div>
    </div>
  );
};

export default VideoModal;
