import React, { useEffect, useRef, useState } from 'react';

export default function ManualModal({ isOpen, onClose, videos = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentSlide(0); // Reset to first slide on open
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleScroll = () => {
    const container = scrollRef.current;
    const slideWidth = container.offsetWidth;
    const index = Math.round(container.scrollLeft / slideWidth);
    setCurrentSlide(index);
  };

  const goToSlide = (index) => {
    const container = scrollRef.current;
    const slideWidth = container.offsetWidth;
    container.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
    setCurrentSlide(index);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-[46vh] rounded-lg p-5 relative max-h-[90vh] overflow-hidden">
        {/* Exit Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-lg"
        >
          ✕
        </button>


        {/* Horizontal scrollable videos */}
        <div
          className="flex overflow-x-auto snap-x snap-mandatory space-x-4 hide-scrollbar"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {videos.map((video, idx) => (
            <div
              key={idx}
              className="min-w-full snap-center flex-shrink-0 overflow-hidden rounded-lg shadow-lg bg-white flex items-center justify-center"
            >
              <video
                className="w-[350px] h-[600px] aspect-[9/16] rounded shadow"
                autoPlay
                muted
                playsInline
                loop
                src={video}
              />
            </div>
          ))}
        </div>

        {/* Dot indicators OR Close button on last video */}
        <div className="flex justify-end mt-4">
        {currentSlide === videos.length - 1 ? (
            <button
            onClick={onClose}
            className="bg-dark-pastel-orange text-white font-medium px-5 py-2 rounded hover:bg-dark-grayish-orange"
            >
            Close 
            </button>
        ) : (
            <div className="flex space-x-2">
            {videos.map((_, idx) => (
                <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-3 w-3 rounded-full ${
                    idx === currentSlide ? 'bg-dark-pastel-orange' : 'bg-gray-300'
                }`}
                />
            ))}
            </div>
        )}
        </div>

      </div>
    </div>
  );
}
