import { X, ZoomIn, ZoomOut, Download, Share2, HardDrive } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useMediaCache } from "../hooks/useMediaCache";

const ImageModal = ({ isOpen, imageUrl, onClose, caption }) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [showControls, setShowControls] = useState(true);
    const imageRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    // Media caching hook
    const { isCached, isLoading, cacheMedia, cachedUrl } = useMediaCache(
        imageUrl,
        "image/jpeg"
    );

    const MIN_ZOOM = 1;
    const MAX_ZOOM = 5;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            setShowControls(true);
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isOpen]);

    const resetControlsTimeout = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    const handleContainerMove = () => {
        resetControlsTimeout();
    };

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.5, MAX_ZOOM));
        resetControlsTimeout();
    };

    const handleZoomOut = () => {
        setZoom((prev) => {
            const newZoom = Math.max(prev - 0.5, MIN_ZOOM);
            if (newZoom === MIN_ZOOM) {
                setPosition({ x: 0, y: 0 });
            }
            return newZoom;
        });
        resetControlsTimeout();
    };

    const handleWheel = (e) => {
        if (!imageRef.current) return;
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.5 : 0.5;
        setZoom((prev) => {
            const newZoom = Math.max(
                MIN_ZOOM,
                Math.min(prev + delta, MAX_ZOOM)
            );
            if (newZoom === MIN_ZOOM) {
                setPosition({ x: 0, y: 0 });
            }
            return newZoom;
        });
        resetControlsTimeout();
    };

    const handleMouseDown = (e) => {
        if (zoom === 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || zoom === 1) return;

        const container = containerRef.current;
        if (!container || !imageRef.current) return;

        const containerRect = container.getBoundingClientRect();
        const imageWidth = imageRef.current.offsetWidth * zoom;
        const imageHeight = imageRef.current.offsetHeight * zoom;

        let newX = e.clientX - dragStart.x;
        let newY = e.clientY - dragStart.y;

        // Limit dragging boundaries
        const maxX = Math.max(0, (imageWidth - containerRect.width) / 2);
        const maxY = Math.max(0, (imageHeight - containerRect.height) / 2);

        newX = Math.max(-maxX, Math.min(maxX, newX));
        newY = Math.max(-maxY, Math.min(maxY, newY));

        setPosition({ x: newX, y: newY });
        handleContainerMove();
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleDoubleClick = () => {
        if (zoom === 1) {
            setZoom(2);
        } else {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        }
        resetControlsTimeout();
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            setDragStart({ x: distance, y: 0 });
        } else if (e.touches.length === 1 && zoom > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y,
            });
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );

            const scale = distance / dragStart.x;
            const newZoom = Math.max(
                MIN_ZOOM,
                Math.min(zoom * scale, MAX_ZOOM)
            );
            setZoom(newZoom);
            setDragStart({ x: distance, y: 0 });
        } else if (e.touches.length === 1 && isDragging && zoom > 1) {
            e.preventDefault();
            const container = containerRef.current;
            if (!container || !imageRef.current) return;

            const containerRect = container.getBoundingClientRect();
            const imageWidth = imageRef.current.offsetWidth * zoom;
            const imageHeight = imageRef.current.offsetHeight * zoom;

            let newX = e.touches[0].clientX - dragStart.x;
            let newY = e.touches[0].clientY - dragStart.y;

            const maxX = Math.max(0, (imageWidth - containerRect.width) / 2);
            const maxY = Math.max(0, (imageHeight - containerRect.height) / 2);

            newX = Math.max(-maxX, Math.min(maxX, newX));
            newY = Math.max(-maxY, Math.min(maxY, newY));

            setPosition({ x: newX, y: newY });
            handleContainerMove();
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleDownload = async () => {
        try {
            // Use cached URL if available, otherwise fetch from source
            let blobToDownload = null;

            if (isCached && cachedUrl && cachedUrl.startsWith("blob:")) {
                // Convert blob URL back to blob
                const response = await fetch(cachedUrl);
                blobToDownload = await response.blob();
            } else {
                // Fallback to fetching from original URL
                const response = await fetch(imageUrl);
                blobToDownload = await response.blob();
            }

            const url = window.URL.createObjectURL(blobToDownload);
            const a = document.createElement("a");
            a.href = url;
            a.download = `image-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading image:", error);
        }
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
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    cursor:
                        zoom > 1
                            ? isDragging
                                ? "grabbing"
                                : "grab"
                            : "default",
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
                            {caption ? "Image" : ""}
                        </h2>
                        <div className="flex gap-2">
                            {!isCached && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        cacheMedia();
                                    }}
                                    disabled={isLoading}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-2 transition-colors"
                                    aria-label="Download image"
                                    title="Download image for offline viewing"
                                >
                                    <HardDrive className="w-5 h-5 text-white" />
                                </button>
                            )}
                            <button
                                onClick={handleDownload}
                                className="bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                                aria-label="Download image"
                            >
                                <Download className="w-5 h-5 text-white" />
                            </button>
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: "Image",
                                            text: caption,
                                            url: imageUrl,
                                        });
                                    }
                                }}
                                className="bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                                aria-label="Share image"
                            >
                                <Share2 className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Zoom Controls */}
                <div
                    className={`absolute top-1/2 left-4 z-10 flex flex-col gap-2 -translate-y-1/2 transition-opacity duration-300 ${
                        showControls ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <button
                        onClick={handleZoomOut}
                        disabled={zoom === MIN_ZOOM}
                        className="bg-black/50 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-2 transition-colors"
                        aria-label="Zoom out"
                    >
                        <ZoomOut className="w-6 h-6 text-white" />
                    </button>
                    <button
                        onClick={handleZoomIn}
                        disabled={zoom === MAX_ZOOM}
                        className="bg-black/50 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-2 transition-colors"
                        aria-label="Zoom in"
                    >
                        <ZoomIn className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Zoom Percentage */}
                <div
                    className={`absolute bottom-24 left-1/2 -translate-x-1/2 z-10 bg-black/70 rounded-full px-4 py-2 text-center text-white text-sm transition-opacity duration-300 ${
                        showControls ? "opacity-100" : "opacity-0"
                    }`}
                >
                    {Math.round(zoom * 100)}%
                </div>

                {/* Image Container */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 border-4 border-white border-t-blue-500 rounded-full animate-spin" />
                                <span className="text-white text-sm font-medium">
                                    Downloading...
                                </span>
                            </div>
                        </div>
                    )}

                    <img
                        ref={imageRef}
                        src={cachedUrl}
                        alt={caption || "Full size image"}
                        className={`max-w-full max-h-full object-contain select-none ${
                            !isCached ? "blur-md" : ""
                        }`}
                        style={{
                            transform: `scale(${zoom}) translate(${
                                position.x / zoom
                            }px, ${position.y / zoom}px)`,
                            transition:
                                isDragging || zoom === 1
                                    ? "none"
                                    : "transform 0.2s ease-out",
                        }}
                        onDoubleClick={handleDoubleClick}
                        draggable={false}
                    />
                </div>

                {/* Footer - Description */}
                {caption && (
                    <div
                        className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                            showControls ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <p className="text-white text-sm break-words">
                            {caption}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageModal;
