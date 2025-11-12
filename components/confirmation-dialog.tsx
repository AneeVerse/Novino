"use client";

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'bg-red-500/20 text-red-400',
      button: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
    },
    warning: {
      icon: 'bg-yellow-500/20 text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/20',
    },
    info: {
      icon: 'bg-blue-500/20 text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${styles.icon}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6 pl-[52px]">
          <p className="text-white/70 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-[#222222] text-white/80 rounded-lg hover:bg-[#2A2A2A] hover:text-white transition-all border border-[#333333] font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white rounded-lg transition-all shadow-lg font-medium ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

