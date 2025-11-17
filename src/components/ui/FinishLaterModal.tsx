import React, { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface FinishLaterModalProps {
  isOpen: boolean;
  methodName: string;
  onConfirm: () => void;
}

export const FinishLaterModal: React.FC<FinishLaterModalProps> = ({
  isOpen,
  methodName,
  onConfirm,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Focus trapping
  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstFocusableRef.current?.focus();

      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="finish-later-title"
        aria-describedby="finish-later-description"
        className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-xl shadow-2xl border border-[#333]/50 max-w-md w-full mx-4"
      >
        {/* Header with icon */}
        <div className="flex items-center justify-center pt-6 pb-4">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <h2
            id="finish-later-title"
            className="text-xl font-semibold text-white mb-3"
          >
            ¿Terminar más tarde?
          </h2>

          <p
            id="finish-later-description"
            className="text-gray-300 text-sm leading-relaxed mb-6"
          >
            You can resume the {methodName} method anytime from the{" "}
            <span className="font-semibold text-blue-400">Reports</span>{" "}
            section in the side menu.
          </p>

          {/* Button */}
          <button
            ref={firstFocusableRef}
            onClick={onConfirm}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#232323] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishLaterModal;