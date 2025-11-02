// React default import not required with new JSX transform
import { Construction } from "lucide-react";

const Overlay = ({ children }) => {
    return (
        <div className="absolute w-full h-full min-h-screen z-0">
            {/* Background content - blurred and dimmed */}
            <div className="w-full h-full pointer-events-none select-none opacity-40 blur-sm">
                {children}
            </div>

            {/* Overlay modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-md">
                <div className="bg-slate-900 dark:bg-gray-900 rounded-3xl shadow-2xl p-12 max-w-md mx-4 transform transition-all">
                    {/* Icon container */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl"></div>
                            <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-5">
                                <Construction
                                    className="w-12 h-12 text-white"
                                    strokeWidth={2.5}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-bold text-gray-200 dark:text-white tracking-tight">
                            Under Development
                        </h2>
                        <p className="text-zinc-400 dark:text-gray-400 text-base leading-relaxed">
                            We&apos;re working hard to bring you something
                            amazing. This page will be available soon.
                        </p>
                    </div>

                    {/* Decorative line */}
                    <div className="mt-8 flex justify-center">
                        <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overlay;
