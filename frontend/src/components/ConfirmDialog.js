import { useState } from 'react';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${variant === 'destructive' ? 'bg-red-100' : 'bg-blue-100'}`}>
            <AlertTriangle className={`w-6 h-6 ${variant === 'destructive' ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 text-sm">{message}</p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-full"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-full ${variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-blue hover:bg-brand-blue/90'}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [resolveRef, setResolveRef] = useState(null);

  const confirm = (options = {}) => {
    return new Promise((resolve) => {
      setConfig(options);
      setIsOpen(true);
      setResolveRef(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolveRef) resolveRef(true);
    setIsOpen(false);
  };

  const handleClose = () => {
    if (resolveRef) resolveRef(false);
    setIsOpen(false);
  };

  const DialogComponent = () => (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      {...config}
    />
  );

  return { confirm, DialogComponent };
}
