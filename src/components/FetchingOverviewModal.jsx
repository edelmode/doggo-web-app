import React from 'react';

const FetchingOverviewModal = ({ toggleOverviewModal, toggleFeatureModal }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="relative p-6 w-full max-w-lg max-h-[80%] bg-white rounded-lg shadow-lg overflow-auto">
                <div className="flex items-center justify-between p-4 border-b rounded-t border-b-doggo">
                    <h3 className="text-xl font-semibold text-doggo">
                        Doggo Fetching Device
                    </h3>
                    <button
                        onClick={toggleOverviewModal}
                        className="text-black bg-transparent hover:bg-yellow rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                        type="button"
                    >
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <p className="mt-4 text-xl font-sans font-semibold text-black text-center">Play with your Dog from Afar</p>
                <p className="text-black mb-4">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>

                <h3 className="mt-4 text-xl font-sans font-semibold text-black text-center">Fetch and Play</h3>
                <p className="text-black mb-4">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>

                <h3 className="mt-4 text-xl font-sans font-semibold text-black text-center">DOGGO Makes it FUN</h3>
                <p className="text-black mb-4">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>

                <div className="flex justify-end">
                  <button 
                        className="text-white inline-flex w-full justify-center bg-doggo hover:bg-yellow focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        onClick={toggleFeatureModal}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FetchingOverviewModal;
