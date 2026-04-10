import { Download, Maximize, RotateCcw } from "lucide-react";
import { useFace } from "../../context/HomeContext";

export const Gallery = () => {
    const { matches, handleReset, handleFullImage } = useFace();

    return (
        <div className="h-screen py-5 px-8">
            <div className="min-h-full px-10 pt-6 pb-3 bg-white rounded-xl shadow-lg shadow-gray-500">
                <div className="flex justify-between items-center">
                    <p className="text-4xl text-gray-700 text-semibold">Your Photos</p>
                    <button
                        onClick={handleReset}
                        className="flex gap-1 items-center text-lg font-semibold cursor-pointer text-indigo-700 hover:text-indigo-500 transition"
                    >
                        <RotateCcw size={18} /> Search Again
                    </button>
                </div>
                <div className="my-4 grid grid-cols-4 gap-4">
                    {matches.map((v, i) => (
                        <div key={v.id} className="mb-2">
                            <div className="relative group transition-transform duration-300 hover:scale-103">
                                <img
                                    src={v?.image}
                                    alt={`${v?.image}.jpeg`}
                                    className="relative rounded-xl transition-transform duration-300"
                                />
                                <div
                                    onClick={() => handleFullImage(i)}
                                    className="absolute inset-0 flex justify-center items-center hover:bg-black/10 rounded-xl cursor-pointer"
                                >
                                    <Maximize
                                        size={24}
                                        className="text-white opacity-0 group-hover:opacity-100 transition"
                                    />
                                </div>
                            </div>
                            <div className="flex mx-3 justify-between mt-1.5">
                                <p className="text-gray-800 font-semibold">{`Face-${i + 1}.jpeg`}</p>
                                <a
                                    href={v.image}
                                    download={`Face_${i + 1}.jpeg`}
                                    className="cursor-pointer text-blue-700 hover:text-blue-500"
                                >
                                    <Download size={22} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};