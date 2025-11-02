import { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { X, Check } from "lucide-react";

const ConfirmModal = ({ open, title, description, onConfirm, onCancel }) => {
    const [visible, setVisible] = useState(false); // mounted state
    const [closing, setClosing] = useState(false); // whether we're playing exit
    const modalRef = useRef(null);
    const pendingActionRef = useRef(null); // 'confirm' | 'cancel' | null

    // When parent opens, mount modal and ensure we're in enter state
    useEffect(() => {
        if (open) {
            setVisible(true);
            setClosing(false);
            pendingActionRef.current = null;
        } else if (!open && visible) {
            // parent asked to close; begin exit
            setClosing(true);
            pendingActionRef.current = "cancel";
        }
    }, [open, visible]);

    // animationend handler — only act when exit animation finishes
    const handleAnimationEnd = useCallback(
        (e) => {
            if (e.target !== modalRef.current) return;
            if (closing) {
                setVisible(false);
                setClosing(false);
                const action = pendingActionRef.current;
                pendingActionRef.current = null;
                if (action === "confirm") {
                    onConfirm && onConfirm();
                } else {
                    onCancel && onCancel();
                }
            }
        },
        [closing, onCancel, onConfirm]
    );

    useEffect(() => {
        const el = modalRef.current;
        if (!el) return;
        el.addEventListener("animationend", handleAnimationEnd);
        return () => el.removeEventListener("animationend", handleAnimationEnd);
    }, [handleAnimationEnd]);

    // Trigger an animated close; record which action to perform after animation
    const triggerClose = (action = "cancel") => {
        pendingActionRef.current = action;
        setClosing(true);
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-240 ${
                    closing ? "opacity-0" : "opacity-100"
                }`}
                onClick={() => triggerClose("cancel")}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className={`relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-5 transform ${
                    closing ? "animate-modalExit" : "animate-modalEnter"
                }`}
                role="dialog"
                aria-modal="true"
            >
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                    {title}
                </h3>
                <p className="text-sm text-zinc-400 mb-4">{description}</p>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => triggerClose("cancel")}
                        className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors duration-150 flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={() => triggerClose("confirm")}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-150 flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes modalEnter {
                    0% { opacity: 0; transform: translateY(10px) scale(0.985); }
                    60% { opacity: 1; transform: translateY(-4px) scale(1.01); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes modalExit {
                    0% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(10px) scale(0.985); }
                }
                .animate-modalEnter { animation: modalEnter 240ms cubic-bezier(.16,1,.3,1) both; }
                .animate-modalExit { animation: modalExit 200ms cubic-bezier(.4,0,1,1) both; }
            `}</style>
        </div>
    );
};

ConfirmModal.propTypes = {
    open: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

ConfirmModal.defaultProps = {
    open: false,
    title: "Confirm action",
    description: "Are you sure?",
};

export default ConfirmModal;
