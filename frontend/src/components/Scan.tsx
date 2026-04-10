import { ImageIcon, RotateCcw, Search, Upload, X, XCircle } from "lucide-react";
import { useFace } from "../context/FaceContext";
import { CameraCapture } from "./CameraCapture";

export const Scan = () => {
    const {
        mode, source, photo, error,
        isSearching, fileInputRef,
        handleCapturePhoto, handleSearch,
        handleRetake, handleCancel,
    } = useFace();

    return (
        <div className="w-lg h-screen mx-auto flex justify-center items-center">
            <div className="w-full bg-white rounded-2xl px-8 py-3 shadow-lg shadow-gray-700 relative">
                <div className="mx-auto text-center text-2xl text-gray-700 font-semibold mb-3">
                    Search a Face
                </div>

                {mode === "capture" && <CameraCapture />}

                {mode === "preview" && photo && (
                    <img
                        src={photo}
                        alt="Preview"
                        className="h-[55vh] mx-auto rounded-xl object-cover"
                    />
                )}

                {error && (
                    <div className="flex justify-center items-center mt-1 gap-1 text-sm text-red-800 font-semibold">
                        <XCircle size={15} /> {error}
                    </div>
                )}

                {mode === "capture" && (
                    <div className="w-sm flex mx-auto mt-3 font-semibold gap-8 text-white">
                        <button
                            onClick={handleCapturePhoto}
                            className="w-full flex items-center justify-center gap-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer transition"
                        >
                            <ImageIcon size={18} /> Take Photo
                        </button>
                        <button
                            onClick={handleCancel}
                            className="w-full flex items-center justify-center gap-1 py-2 bg-red-600 rounded-lg cursor-pointer hover:bg-red-500 transition"
                        >
                            <X size={18} /> Cancel
                        </button>
                    </div>
                )}

                {mode === "preview" && (
                    <div className="w-md flex mx-auto mt-3 font-semibold gap-4 text-white">
                        <button
                            disabled={isSearching}
                            onClick={() => photo && handleSearch(photo)}
                            className="flex flex-1 items-center justify-center gap-1 py-2 rounded-lg cursor-pointer bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Search size={16} /> Search
                        </button>

                        {source === "camera" && (
                            <button
                                onClick={handleRetake}
                                className="flex flex-1 items-center justify-center gap-1 py-2 bg-green-700 rounded-lg cursor-pointer hover:bg-green-600 transition"
                            >
                                <RotateCcw size={16} /> Retake
                            </button>
                        )}

                        {source === "upload" && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-1.5 px-3 items-center justify-center gap-1 py-2 bg-green-700 rounded-lg cursor-pointer hover:bg-green-600 transition"
                            >
                                <Upload size={16} /> Upload Another
                            </button>
                        )}

                        <button
                            onClick={handleCancel}
                            className="flex flex-1 items-center justify-center gap-1 py-2 bg-red-600 rounded-lg cursor-pointer hover:bg-red-500 transition"
                        >
                            <X size={16} /> Cancel
                        </button>
                    </div>
                )}

                {isSearching && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl z-5">
                        <div className="flex flex-col items-center gap-3 text-white">
                            <div className="w-10 h-10 text-gray-700 border-5 border-gray-500 border-t-transparent rounded-full animate-spin" />
                            <p className="font-semibold text">Searching your face...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};