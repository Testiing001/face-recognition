import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { useFace } from "../../context/HomeContext";

export const Viewer = () => {
    const {
        matches, currentIndex, isImageLoading,
        setCurrentIndex, setShow, setIsImageLoading,
    } = useFace();

    return (
        <div className="bg-black/90">
            <div className="fixed w-full h-14 top-0 left-0 bg-black/50 z-3">
                
                {matches.length > 1 && (
                    <div className="absolute top-4 left-4 text-white mx-6">
                        Photos: {currentIndex + 1} / {matches.length}
                    </div>
                )}

                <div className="absolute top-4 right-4 flex gap-4">
                    <a
                        href={matches[currentIndex]?.image}
                        download={`face_${currentIndex + 1}.jpeg`}
                        className="text-gray-100 hover:text-white cursor-pointer hover:scale-120 transition-transform"
                    >
                        <Download size={22} />
                    </a>
                    <button
                        onClick={() => setShow("gallery")}
                        className="text-gray-100 hover:text-white cursor-pointer hover:scale-120 transition-transform"
                    >
                        <X size={26} />
                    </button>
                </div>
            </div>

            <div className="relative flex w-full h-screen justify-between items-center">
                <button
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className="text-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:hover:text-gray-300 hover:text-white transition"
                >
                    <ChevronLeft size={64} />
                </button>

                <img
                    src={matches[currentIndex]?.image}
                    alt={`${currentIndex + 1}.jpeg`}
                    onLoad={() => setIsImageLoading(false)}
                    onLoadStart={() => setIsImageLoading(true)}
                    className="h-screen object-contain"
                />

                <button
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    disabled={currentIndex === matches.length - 1}
                    className="text-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:hover:text-gray-300 hover:text-white transition"
                >
                    <ChevronRight size={64} />
                </button>

                {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-5">
                        <div className="flex flex-col items-center gap-2 text-white">
                            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            <p className="font-semibold">Loading image...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};