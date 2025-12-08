import React from 'react';
import { X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Ya',
    cancelText = 'Batal',
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    const getButtonColor = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-500 hover:bg-red-600 focus:ring-red-300';
            case 'warning':
                return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300';
            case 'info':
                return 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300';
            default:
                return 'bg-red-500 hover:bg-red-600 focus:ring-red-300';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 animate-slide-up">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className={`text-lg font-bold ${variant === 'danger' ? 'text-red-600' : 'text-gray-800'}`}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 text-center text-lg">{message}</p>
                </div>

                <div className="flex items-center justify-center gap-4 p-6 pt-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-6 py-2.5 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 shadow-lg ${getButtonColor()}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
