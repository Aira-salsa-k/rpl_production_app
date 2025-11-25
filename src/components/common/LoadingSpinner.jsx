import { RefreshCw } from 'lucide-react';

const LoadingSpinner = ({ message = "Memuat Data..." }) => {
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center">
      <RefreshCw className="animate-spin mb-2" />
      {message}
    </div>
  );
};

export default LoadingSpinner;