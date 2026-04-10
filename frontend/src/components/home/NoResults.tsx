import { RotateCcw, UserX } from "lucide-react";
import { useFace } from "../../context/HomeContext";

export const NoResults = () => {
    const { handleReset } = useFace();

    return (
        <div className="w-lg h-screen mx-auto flex justify-center items-center">
            <div className="w-full h-[70vh] rounded-2xl px-10 py-4 bg-white shadow-lg shadow-gray-700">
                <button
                    onClick={handleReset}
                    className="w-full flex justify-end items-center gap-1 mb-4 font-semibold cursor-pointer text-indigo-700 hover:text-indigo-600 transition"
                >
                    <RotateCcw size={18} /> Search Again
                </button>
                <div className="w-full h-[80%] flex flex-col justify-center items-center gap-3 bg-gray-700 rounded-2xl border-3 border-solid border-gray-900">
                    <UserX size={48} className="text-gray-400" />
                    <p className="text-gray-300">No Results Found</p>
                </div>
                <p className="text-center text-gray-700 font-semibold mt-3">
                    Try uploading a clear image or scan your face again.
                </p>
            </div>
        </div>
    );
};