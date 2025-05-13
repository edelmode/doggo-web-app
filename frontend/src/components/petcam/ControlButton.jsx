import React from 'react';
import { Mic } from 'lucide-react';

export default function ControlButtons({ loading, error, handleMicToggle }) {
    return (
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
    );
}