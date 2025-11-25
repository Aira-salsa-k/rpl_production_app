import { X } from 'lucide-react';

const Modal = ({ children, onClose, title, size = 'max-w-2xl' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-xl w-full ${size} max-h-[90vh] overflow-y-auto`}>
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;