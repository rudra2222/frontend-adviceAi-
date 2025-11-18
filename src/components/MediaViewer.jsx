import { Play, Pause, Image, Film } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const MediaViewer = ({ type, src, alt, onOpen, description, direction }) => {
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const mediaRef = useRef(null);

    const handleLoadedMetadata = (e) => {
        if (e.target.duration) {
            setDuration(e.target.duration);
        }
    };

    const handleTimeUpdate = (e) => {
        if (e.target.currentTime) {
            setCurrentTime(e.target.currentTime);
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds || !Number.isFinite(seconds)) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleAudioPlayPause = (e) => {
        e.stopPropagation();
        if (mediaRef.current) {
            if (isPlaying) {
                mediaRef.current.pause();
                setIsPlaying(false);
            } else {
                mediaRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleAudioSeek = (e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        if (mediaRef.current) {
            mediaRef.current.currentTime = percentage * duration;
            setCurrentTime(percentage * duration);
        }
    };

    if (type === "image") {
        return (
            <div
                className={`relative sm:max-w-[200px] rounded-md overflow-hidden group ${
                    direction === "outbound"
                        ? "bg-[#144D37] text-white"
                        : "bg-zinc-800 text-white"
                }`}
                onMouseEnter={() => setShowOverlay(true)}
                onMouseLeave={() => setShowOverlay(false)}
            >
                <img
                    src={src}
                    alt={alt}
                    className="sm:max-w-[200px] rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    loading="lazy"
                    onClick={onOpen}
                />
                {/* Image Badge */}
                <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm rounded p-1">
                    <Image className="w-4 h-4 text-white" />
                </div>
            </div>
        );
    }

    if (type === "video") {
        return (
            <div
                className={`relative sm:max-w-[200px] rounded-md overflow-hidden group ${
                    direction === "outbound"
                        ? "bg-[#144D37] text-white"
                        : "bg-zinc-800 text-white"
                }`}
                onMouseEnter={() => setShowOverlay(true)}
                onMouseLeave={() => setShowOverlay(false)}
            >
                <video
                    ref={mediaRef}
                    src={src}
                    className="sm:max-w-[200px] rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    preload="metadata"
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={onOpen}
                />

                {/* Play Button Overlay */}
                {showOverlay && (
                    <div
                        className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md transition-all duration-200 backdrop-blur-sm"
                        onClick={onOpen}
                    >
                        <div className="bg-white/90 hover:bg-white rounded-full p-3 transition-all shadow-lg">
                            <Play className="w-6 h-6 text-black fill-black" />
                        </div>
                    </div>
                )}

                {/* Duration Badge */}
                {duration > 0 && (
                    <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium">
                        {formatDuration(duration)}
                    </div>
                )}

                {/* Video Icon Badge */}
                <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm rounded p-1">
                    <Film className="w-4 h-4 text-white" />
                </div>
            </div>
        );
    }

    if (type === "audio") {
        return (
            <div
                className={`bg-gradient-to-r from-zinc-800 to-zinc-700 dark:from-zinc-700 dark:to-zinc-600 rounded-xl w-full sm:max-w-2xl p-2 shadow-xl backdrop-blur-sm border border-zinc-700/50 dark:border-zinc-600/50 flex items-center gap-3 ${
                    direction === "outbound"
                        ? "bg-[#144D37] text-white"
                        : "bg-zinc-800 text-white"
                }`}
            >
                {/* Play/Pause Button */}
                <button
                    onClick={handleAudioPlayPause}
                    className="flex-shrink-0 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 rounded-full p-2 transition-all hover:shadow-lg hover:scale-110 active:scale-95"
                    aria-label="Play/Pause audio"
                >
                    {isPlaying ? (
                        <Pause className="w-4 h-4 text-white fill-white" />
                    ) : (
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    )}
                </button>

                {/* Progress and Duration */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div
                        className="h-1 bg-zinc-600 dark:bg-zinc-500 hover:bg-zinc-500 dark:hover:bg-zinc-400 rounded-full cursor-pointer transition-all group"
                        onClick={handleAudioSeek}
                    >
                        <div
                            className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all shadow-md"
                            style={{
                                width: `${
                                    duration > 0
                                        ? (currentTime / duration) * 100
                                        : 0
                                }%`,
                            }}
                        />
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-zinc-300 dark:text-zinc-200 text-xs font-semibold">
                            {formatDuration(currentTime)}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-300 text-xs font-medium">
                            {formatDuration(duration)}
                        </span>
                    </div>
                </div>

                {/* Hidden Audio Element */}
                <audio
                    ref={mediaRef}
                    src={src}
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    style={{ display: "none" }}
                />
            </div>
        );
    }

    return null;
};

export default MediaViewer;
