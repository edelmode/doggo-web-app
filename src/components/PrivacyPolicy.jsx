import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#f7f2f2] rounded-lg shadow-md mt-8 mb-8">
      <h1 className="text-3xl font-bold mb-4">DOGGO Privacy Policy</h1>
      <p className="text-gray-700 mb-4">
        <strong>Effective Date:</strong> [Insert Date]
      </p>
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
  );
};

export default PrivacyPolicy;
