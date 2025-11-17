import {
    X,
    Play,
    Pause,
    Maximize2,
    Minimize2,
    Download,
    Share2,
    Volume2,
    VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const VideoModal = ({ isOpen, videoUrl, onClose, description }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            setIsPlaying(false);
            setCurrentTime(0);
            setShowControls(true);
        } else {
            document.body.style.overflow = "unset";
            if (isFullscreen) {
                setIsFullscreen(false);
            }
        }

        return () => {
            document.body.style.overflow = "unset";
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isOpen, isFullscreen]);

    const resetControlsTimeout = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
        resetControlsTimeout();
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        if (videoRef.current) {
            videoRef.current.currentTime = percentage * duration;
            setCurrentTime(percentage * duration);
        }
        resetControlsTimeout();
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
        }
        resetControlsTimeout();
    };

    const toggleMute = () => {
        if (videoRef.current) {
            if (isMuted) {
                videoRef.current.volume = volume;
                setIsMuted(false);
            } else {
                videoRef.current.volume = 0;
                setIsMuted(true);
            }
        }
        resetControlsTimeout();
    };

    const handleFullscreen = async () => {
        if (!containerRef.current) return;

        try {
            if (!isFullscreen) {
                if (containerRef.current.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                } else if (containerRef.current.webkitRequestFullscreen) {
                    await containerRef.current.webkitRequestFullscreen();
                }
                setIsFullscreen(true);
            } else {
                if (document.fullscreenElement) {
                    await document.exitFullscreen();
                } else if (document.webkitFullscreenElement) {
                    await document.webkit?.exitFullscreen();
                }
                setIsFullscreen(false);
            }
        } catch (error) {
            console.error("Error toggling fullscreen:", error);
        }
        resetControlsTimeout();
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading video:", error);
        }
    };

    const formatTime = (time) => {
        if (!time || !Number.isFinite(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
                onMouseMove={resetControlsTimeout}
                onMouseLeave={() => {
                    if (isPlaying) {
                        setShowControls(false);
                    }
                }}
            >
                {/* Header */}
                <div
                    className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-4 transition-opacity duration-300 ${
                        showControls ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <div className="flex justify-between items-center">
                        <button
                            onClick={onClose}
                            className="bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                        <h2 className="text-white font-semibold text-sm flex-1 text-center truncate px-4">
                            Video
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownload}
                                className="bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                                aria-label="Download video"
                            >
                                <Download className="w-5 h-5 text-white" />
                            </button>
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: "Video",
                                            text: description,
                                            url: videoUrl,
                                        });
                                    }
                                }}
                                className="bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                                aria-label="Share video"
                            >
                                <Share2 className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Video Container */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="max-w-full max-h-full object-contain"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    >
                        Your browser does not support video playback.
                    </video>

                    {/* Play/Pause Overlay */}
                    <button
                        onClick={togglePlayPause}
                        className={`absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-all duration-300 ${
                            showControls ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        {isPlaying ? (
                            <Pause className="w-16 h-16 text-white" />
                        ) : (
                            <Play className="w-16 h-16 text-white" />
                        )}
                    </button>
                </div>

                {/* Bottom Controls */}
                <div
                    className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
                        showControls ? "opacity-100" : "opacity-0"
                    }`}
                >
                    {/* Progress Bar */}
                    <div
                        className="w-full h-1 bg-white/20 cursor-pointer hover:h-2 transition-all"
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full bg-red-500"
                            style={{
                                width: `${(currentTime / duration) * 100}%`,
                            }}
                        />
                    </div>

                    <div className="p-4 space-y-3">
                        {/* Time Display */}
                        <div className="text-white text-xs text-right">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={togglePlayPause}
                                    className="bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                                    aria-label="Play/Pause"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-5 h-5 text-white" />
                                    ) : (
                                        <Play className="w-5 h-5 text-white" />
                                    )}
                                </button>

                                {/* Volume Control */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleMute}
                                        className="bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                                        aria-label="Mute"
                                    >
                                        {isMuted ? (
                                            <VolumeX className="w-5 h-5 text-white" />
                                        ) : (
                                            <Volume2 className="w-5 h-5 text-white" />
                                        )}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                                                (isMuted ? 0 : volume) * 100
                                            }%, rgba(255,255,255,0.2) ${
                                                (isMuted ? 0 : volume) * 100
                                            }%, rgba(255,255,255,0.2) 100%)`,
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleFullscreen}
                                className="bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                                aria-label="Toggle fullscreen"
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="w-5 h-5 text-white" />
                                ) : (
                                    <Maximize2 className="w-5 h-5 text-white" />
                                )}
                            </button>
                        </div>

                        {/* Description */}
                        {description && (
                            <p className="text-white text-sm break-words">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
