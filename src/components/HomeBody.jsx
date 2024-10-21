import React from 'react';


const HomeBody = () => {
    return (
        <div className='text-black bg-[#f7f2f2] min-h-screen flex flex-col justify-center items-center'>
            <div className="text-center">
                <h1 className="text-black font-['Montserrat'] sm:text-6xl text-[2.75rem] italic font-bold leading-[100%]">
                    DOGGO
                </h1>
            </div>

            <div className="flex justify-center items-center my-5">
                <button 
                    className="flex flex-shrink-0 justify-center text-white items-center gap-2 w-[15rem] lg:h-[3.5rem] rounded-full bg-doggo md:text-xl font-bold md:leading-[100%] hover:bg-yellow hover:transition duration-300 py-4"
                >
                    Get Started
                </button>
            </div>

        </div>
    );
};

export default HomeBody;
