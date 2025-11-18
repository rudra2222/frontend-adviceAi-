import { Play, Pause, Image, Film, Download, HardDrive } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useMediaCache } from "../hooks/useMediaCache";

const MediaViewer = ({ type, src, alt, onOpen, caption, direction }) => {
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const mediaRef = useRef(null);

    // WhatsApp-like SVG spinner
    const Spinner = ({ size = "md", ariaLabel = "Loading" }) => {
        const dim = size === "lg" ? 32 : 16;
        const stroke = size === "lg" ? 4 : 3;
        // WhatsApp green
        const color = "#25D366";
        return (
            <div
                role="status"
                aria-label={ariaLabel}
                className="flex items-center justify-center"
            >
                <svg
                    width={dim}
                    height={dim}
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden={ariaLabel ? "false" : "true"}
                >
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth={stroke}
                        fill="none"
                    />
                    <path
                        d="M25 5 A20 20 0 0 1 45 25"
                        stroke={color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray="80 120"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 25 25"
                            to="360 25 25"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                    </path>
                </svg>
                <span className="sr-only">{ariaLabel}</span>
            </div>
        );
    };

    // Media caching hook
    const { isCached, isLoading, cacheMedia, cachedUrl } = useMediaCache(
        src,
        type === "image"
            ? "image/jpeg"
            : type === "video"
            ? "video/mp4"
            : "audio/mpeg"
    );

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
                className={`relative min-w-32 min-h-32 sm:max-w-[200px] rounded-md overflow-hidden group ${
                    direction === "outbound"
                        ? "bg-[#144D37] text-white"
                        : "bg-zinc-800 text-white"
                }`}
                onMouseEnter={() => setShowOverlay(true)}
                onMouseLeave={() => setShowOverlay(false)}
            >
                <img
                    src={cachedUrl}
                    alt={alt}
                    className={`sm:max-w-[200px] rounded-md cursor-pointer hover:opacity-90 transition-opacity ${
                        !isCached ? "blur-md" : ""
                    }`}
                    loading="lazy"
                    onClick={onOpen}
                />

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                            <Spinner
                                size="lg"
                                ariaLabel={`Downloading ${type}`}
                            />
                        </div>
                    </div>
                )}

                {/* Download Overlay */}
                {showOverlay && !isCached && !isLoading && (
                    <div
                        className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md transition-all duration-200 backdrop-blur-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            cacheMedia();
                        }}
                    >
                        <button className="bg-white/90 hover:bg-white rounded-full p-3 transition-all shadow-lg">
                            <Download className="w-5 h-5 text-black" />
                        </button>
                    </div>
                )}

                {/* Downloaded Indicator */}
                {/* {isCached && (
                    <div className="absolute bottom-1 left-1 bg-green-500/80 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-white text-xs font-medium">
                            Downloaded
                        </span>
                    </div>
                )} */}

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
                    src={cachedUrl}
                    className={`sm:max-w-[200px] rounded-md cursor-pointer hover:opacity-90 transition-opacity ${
                        !isCached ? "blur-md" : ""
                    }`}
                    preload="metadata"
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={onOpen}
                />

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                            <Spinner
                                size="lg"
                                ariaLabel={`Downloading ${type}`}
                            />
                        </div>
                    </div>
                )}

                {/* Download or Play Button Overlay */}
                {showOverlay && !isLoading && (
                    <div
                        className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md transition-all duration-200 backdrop-blur-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isCached) {
                                cacheMedia();
                            } else {
                                onOpen();
                            }
                        }}
                    >
                        <div className="bg-white/90 hover:bg-white rounded-full p-3 transition-all shadow-lg">
                            {isCached ? (
                                <Play className="w-6 h-6 text-black fill-black" />
                            ) : (
                                <Download className="w-6 h-6 text-black" />
                            )}
                        </div>
                    </div>
                )}

                {/* Duration Badge */}
                {duration > 0 && (
                    <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium">
                        {formatDuration(duration)}
                    </div>
                )}

                {/* Downloaded Indicator */}
                {/* {isCached && (
                    <div className="absolute bottom-1 left-1 bg-green-500/80 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-white text-xs font-medium">
                            Downloaded
                        </span>
                    </div>
                )} */}

                {/* Video Icon Badge */}
                <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm rounded p-1">
                    <Film className="w-4 h-4 text-white" />
                </div>
            </div>
        );
    }

    if (type === "audio") {
        const handleAudioDownload = async () => {
            try {
                // Use cached URL if available, otherwise fetch from source
                let blobToDownload = null;

                if (isCached && cachedUrl && cachedUrl.startsWith("blob:")) {
                    // Convert blob URL back to blob
                    const response = await fetch(cachedUrl);
                    blobToDownload = await response.blob();
                } else {
                    // Fallback to fetching from original URL
                    const response = await fetch(src);
                    blobToDownload = await response.blob();
                }

                const url = window.URL.createObjectURL(blobToDownload);
                const a = document.createElement("a");
                a.href = url;
                a.download = `audio-${Date.now()}.mp3`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error("Error downloading audio:", error);
            }
        };

        return (
            <div
                className={`min-h-14 bg-gradient-to-r from-zinc-800 to-zinc-700 dark:from-zinc-700 dark:to-zinc-600 rounded-xl w-full sm:max-w-2xl p-2 shadow-xl backdrop-blur-sm border border-zinc-700/50 dark:border-zinc-600/50 flex items-center gap-3 ${
                    direction === "outbound"
                        ? "bg-[#144D37] text-white"
                        : "bg-zinc-800 text-white"
                }`}
            >
                {/* Play/Pause Button - Hidden until cached */}
                {isCached && (
                    <button
                        onClick={handleAudioPlayPause}
                        className="flex-shrink-0 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 rounded-full p-2 transition-all hover:shadow-lg hover:scale-110 active:scale-95 mr-2"
                        aria-label="Play/Pause audio"
                    >
                        {isPlaying ? (
                            <Pause className="w-4 h-4 text-white fill-white" />
                        ) : (
                            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        )}
                    </button>
                )}

                {/* Progress and Duration */}
                <div className="flex-1 min-w-40 flex flex-col gap-0.5">
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
                        <span className="text-zinc-300 dark:text-zinc-200 text-xs font-semibold mr-2">
                            {formatDuration(currentTime)}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-300 text-xs font-medium">
                            {formatDuration(duration)}
                        </span>
                    </div>
                </div>

                {/* Cache Status Indicator */}
                {/* {isCached && (
                    <div className="flex-shrink-0 bg-green-500/80 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-white text-xs font-medium">
                            Downloaded
                        </span>
                    </div>
                )} */}

                {/* Download to Cache Button */}
                {!isCached && !isLoading && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            cacheMedia();
                        }}
                        disabled={isLoading}
                        className="flex-shrink-0 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-2 transition-colors"
                        aria-label="Download audio for offline playing"
                        title="Download audio for offline playing"
                    >
                        <Download className="w-4 h-4 text-white" />
                    </button>
                )}

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="flex-shrink-0 flex items-center gap-2 mr-1">
                        <Spinner size="md" ariaLabel={`Downloading ${type}`} />
                    </div>
                )}

                {/* Save to Device Button - only visible after cached */}
                {isCached && (
                    <button
                        onClick={handleAudioDownload}
                        className="flex-shrink-0 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                        aria-label="Save audio to device"
                        title="Save audio to your device"
                    >
                        <HardDrive className="w-4 h-4 text-white" />
                    </button>
                )}

                {/* Hidden Audio Element */}
                <audio
                    ref={mediaRef}
                    src={cachedUrl}
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
