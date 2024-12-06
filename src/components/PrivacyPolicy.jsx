import React from 'react';

const PrivacyPolicy = ({ togglePrivacyModal }) => {
    return (
        <div className='fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-auto '>
            <div className="relative px-4 w-full max-w-md max-h-full bg-white rounded-lg shadow overflow-y-auto h-[90vh]">
                <div className="max-w-3xl mx-auto px-6 bg-[#f7f2f2] rounded-lg shadow-md mt-8 mb-8">

                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                      <div>
                        <h3 className="text-xl font-semibold text-black">
                            DOGGO Privacy Policy
                            <p className="text-gray-700 mb-4">
                                <strong>Effective Date:</strong> [Insert Date]
                            </p>
                        </h3>
                      </div>

                      <button
                        onClick={togglePrivacyModal} // Fixed: Use the correct function
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        type="button"
                      >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                      </button>
                    </div>

                    <p className="text-gray-700 mb-4">
                        We at DOGGO (“we,” “us,” or “our”) are committed to protecting your privacy.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your
                        information when you visit our website and use the DOGGO device.
                    </p>
                    <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
                    <ul className="list-disc ml-6 text-gray-700 mb-4">
                        <li><strong>Personal Data:</strong> When you sign up or use our services...</li>
                        <li><strong>Device Information:</strong> When interacting with the DOGGO device...</li>
                        <li><strong>Automatic Information:</strong> We may automatically collect...</li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
                    <p className="text-gray-700 mb-4">
                      - To provide and maintain the website and DOGGO device. <br />
                      - To improve your experience by personalizing content and features. <br />
                      - To send you updates, promotions, and information related to DOGGO.
                    </p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing Your Information</h2>
                    <p className="text-gray-700 mb-4">
                      We do not share your personal information with third parties, except with your consent or as required by law.
                    </p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">4. Security of Your Information</h2>
                    <p className="text-gray-700 mb-4">
                      We use reasonable security measures to protect your personal data. However, no method of transmission over the internet is 100% secure.
                    </p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Data Rights</h2>
                    <p className="text-gray-700 mb-4">
                      You have the right to access, correct, or delete your personal information. Contact us at [Insert Email].
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
