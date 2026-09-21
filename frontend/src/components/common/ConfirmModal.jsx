import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-rose-600" />,
    primary: <Info className="w-6 h-6 text-indigo-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
  };

  const bgIcons = {
    danger: 'bg-rose-50',
    primary: 'bg-indigo-50',
    success: 'bg-emerald-50',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`p-3 rounded-full mb-4 ${bgIcons[variant] || bgIcons.primary}`}>
          {icons[variant] || icons.primary}
        </div>
        <p className="text-sm text-slate-600 mb-6">
          {message}
        </p>
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
