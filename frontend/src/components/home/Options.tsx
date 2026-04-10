import { Camera, FolderOpen, ScanFace } from "lucide-react";
import { useFace } from "../../context/HomeContext";

export const Options = () => {
    const { handleCamera, fileInputRef } = useFace();

    return (
        <>
            <h1 className="text-4xl text-center font-semibold text-black/70 my-5">
                Welcome to Face Recognition System
            </h1>
            <div className="w-lg flex mx-auto p-6">
                <div className="w-full h-[70vh] p-4 bg-white rounded-2xl shadow-lg shadow-gray-700">
                    <div className="flex justify-center items-center text-gray-800 gap-2 text-2xl font-semibold py-3">
                        <ScanFace size={32} /> Scan Your Face
                    </div>
                    <div className="max-w-xs mx-auto flex flex-col justify-center gap-6 py-4">
                        <button
                            onClick={handleCamera}
                            className="flex flex-col items-center gap-2 py-10 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-2xl transition cursor-pointer"
                        >
                            <Camera size={32} />
                            <span className="text-sm font-medium">Use Camera</span>
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center gap-2 py-10 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-2xl transition cursor-pointer"
                        >
                            <FolderOpen size={32} />
                            <span className="text-sm font-medium">Upload Photo</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};