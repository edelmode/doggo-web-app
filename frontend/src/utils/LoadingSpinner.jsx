import { CircleNotch } from 'lucide-react';

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col items-center justify-center">
      <CircleNotch className="h-12 w-12 text-dark-pastel-orange animate-spin" />
      <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
    </div>
  );
}