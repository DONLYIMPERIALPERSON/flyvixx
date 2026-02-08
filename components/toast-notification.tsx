'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function ToastNotification({
  message,
  type = 'info',
  duration = 4000,
  onClose
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Match animation duration
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500 flex-shrink-0" />;
      case 'error':
        return <XCircle size={20} className="text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-500 flex-shrink-0" />;
      case 'info':
      default:
        return <Info size={20} className="text-blue-500 flex-shrink-0" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 max-w-md mx-auto transform transition-all duration-300 ease-out ${
        isExiting ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className={`${getBgColor()} border rounded-lg p-4 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 break-words">
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast Manager Component
interface ToastManagerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>;
  onRemove: (id: string) => void;
}

export function ToastManager({ toasts, onRemove }: ToastManagerProps) {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="fixed top-0 left-0 right-0 z-50"
          style={{ top: `${16 + index * 80}px` }}
        >
          <div className="max-w-md mx-auto px-4">
            <ToastNotification
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => onRemove(toast.id)}
            />
          </div>
        </div>
      ))}
    </>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>>([]);

  const addToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 4000
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);

    // Auto-remove after duration + animation time
    setTimeout(() => {
      removeToast(id);
    }, duration + 300);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message: string, duration?: number) =>
    addToast(message, 'success', duration);

  const showError = (message: string, duration?: number) =>
    addToast(message, 'error', duration);

  const showWarning = (message: string, duration?: number) =>
    addToast(message, 'warning', duration);

  const showInfo = (message: string, duration?: number) =>
    addToast(message, 'info', duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastManager: () => <ToastManager toasts={toasts} onRemove={removeToast} />
  };
}