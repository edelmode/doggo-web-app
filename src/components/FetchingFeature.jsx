import React, { useState } from 'react';

export default function FetchingFeature({ toggleFeatureModal }) {
    const [collapsedFeature, setCollapsedFeature] = useState(null);

    const toggleCollapse = (featureId) => {
        setCollapsedFeature(prevId => (prevId === featureId ? null : featureId));
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="relative p-6 w-full max-w-lg max-h-[80%] bg-white rounded-lg shadow-lg overflow-auto">
                <div className="flex items-center justify-between p-4 border-b rounded-t border-b-doggo">
                    <h3 className="text-xl font-semibold text-doggo">
                        Doggo Fetching Device
                    </h3>
                    <button
                        onClick={toggleFeatureModal}
                        className="text-black bg-transparent hover:bg-[#F1D04B] rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                        type="button"
                    >
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-4 md:p-5">
                    <p className="text-doggo mb-4">Explore our Fetching Device:</p>
                    <ul className="space-y-4 mb-4">
                        {['Pet Friendly', 'Interactive', 'Good'].map((featureId) => (
                            <li key={featureId}>
                                <input 
                                    type="radio" 
                                    id={featureId} 
                                    name="features" 
                                    value={featureId} 
                                    className="hidden peer" 
                                    required 
                                />
                                <label 
                                    htmlFor={featureId} 
                                    className="inline-flex items-center justify-between w-full p-5 text-doggo bg-gray-200 border border-doggo rounded-lg cursor-pointer peer-checked:bg-doggo peer-checked:text-white"
                                    onClick={() => toggleCollapse(featureId)}
                                >
                                    <div className="block">
                                        <div className="w-full text-lg font-semibold">{featureId.replace('-', ' ')}</div>
                                        <div className="w-full text-black">Details about {featureId}</div>
                                    </div>
                                    <svg className="w-4 h-4 ms-3 rtl:rotate-180 text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                    </svg>
                                </label>
                                {collapsedFeature === featureId && (
                                    <div className="p-4 text-black">
                                        {/* Content to display when the feature is expanded */}
                                        <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <button 
                        className="text-white inline-flex w-full justify-center bg-doggo hover:bg-yellow focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        onClick={toggleFeatureModal}
                    >
                        Start Fetching
                    </button>
                </div>
            </div>
        </div>
    );
}
