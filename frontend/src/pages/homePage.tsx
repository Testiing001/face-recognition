import axios from "axios";
import { Camera, Download, FolderOpen, ImageIcon, RotateCcw, UserX, XCircle } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

type Status = "idle" | "camera" | "preview" | "result";
type Source = "camera" | "upload" | null;

interface Match {
    id: number;
    image: string;
    face: number;
}

export const HomePage = () => {
    const [status, setStatus] = useState<Status>("idle");
    const [image, setImage] = useState<string>("");
    const [source, setSource] = useState<Source>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [error, setError] = useState<string>("");

    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCaptureImage = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc)    return;
        setImage(imageSrc);
        setStatus("preview");
        setSource("camera");
    }, []);

    const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file)      return;
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result as string);
            setSource("upload");
        };
        reader.readAsDataURL(file);
        e.target.value = "";
        setStatus("preview");
    };

    const handleSearch = async (imageData: string) => {
        setMatches([]);
        setError("");

        try {
            const blob = await fetch(imageData).then((r) => r.blob());
            const form = new FormData();
            form.append("file", blob, "face.png");

            const res = await axios.post("http://localhost:8000/search/", form);
            setMatches(res.data.matches);
            setStatus("result");
        } 
        catch (err: any) {
            setError("error");
            setStatus("preview");
        }
    };

    const handleCancel = () => {
        setStatus("idle");
    }

    const handleRetake = () => {
        setImage("");
        setStatus("camera");
    }

    const handleReset = () => {
        setStatus("idle");
        setMatches([]);
    };

    return (
        <>
            <div className="text-4xl text-white font-semibold text-center mt-3 mb-4">
                Welcome to Face Recognition System
            </div>

            {status === "idle" && <div className="max-w-lg h-[70%] mx-auto mt-15 py-6 rounded-xl bg-gray-700 shadow-lg shadow-black">
                <div className="text-white text-center text-2xl font-semibold mb-6">
                    Scan Your Face
                </div>
                <div className="w-[75%] mx-auto flex flex-col justify-center gap-6">
                    <button
                        onClick={() => setStatus("camera")}
                        className="flex flex-col items-center gap-2 p-10 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 border border-gray-500 hover:border-indigo-500 rounded-xl transition cursor-pointer"
                    >
                        <Camera size={32}/>
                        <span className="text-sm font-medium">Use Camera</span>
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-2 mb-2 p-10 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 border border-gray-500 hover:border-indigo-500 rounded-xl transition cursor-pointer"
                    >
                        <FolderOpen size={32}/>
                        <span className="text-sm font-medium">Upload Image</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={handleUploadImage}
                    />
                </div>
            </div>}

            {status === "camera" && <div className="max-w-xl mx-auto pb-3 px-6 bg-white rounded-xl shadow-lg shadow-black">
                <div className="mx-auto text-center text-lg font-semibold py-3">Search a Face</div>
                <div className="flex flex-col justify-center items-center">
                    <div className="mx-auto overflow-hidden">
                        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="rounded-lg"/>
                    </div>
                    <div className="w-[80%] flex mt-2 font-semibold gap-8 text-white">
                        <button
                            onClick={handleCaptureImage}
                            className="w-full mx-auto flex items-center justify-center gap-2 py-2 rounded-lg cursor-pointer bg-indigo-600 hover:bg-indigo-500 transition"
                        >
                            <ImageIcon size={16} /> Take Photo
                        </button>
                        <button
                            onClick={handleCancel}
                            className="w-full py-2 bg-red-600 rounded-lg cursor-pointer hover:bg-red-500 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>}

            {status === "preview" && <div className="max-w-xl mx-auto pb-3 px-6 bg-white rounded-xl shadow-lg shadow-black">
                <div className="mx-auto text-center text-lg font-semibold py-3">Search a Face</div>
                <div className="flex flex-col justify-center items-center">
                    <div className="mx-auto mb-1">
                        <img src={image} alt="Preview" className="rounded-lg"/>
                    </div>

                    {error && <div className="flex items-center gap-1 mx-auto text-red-800 font-semibold">
                        <XCircle size={15} /> {error}
                    </div>}

                    <div className="w-[90%] flex mt-1 font-semibold gap-4 text-white">
                        <button
                            onClick={() => handleSearch(image)}
                            className="w-full mx-auto flex items-center justify-center gap-2 py-2 rounded-lg cursor-pointer bg-indigo-600 hover:bg-indigo-500 transition"
                        >
                            <ImageIcon size={16} /> Search
                        </button>
                        {source === "camera" ? (
                            <>
                                <button
                                    onClick={handleRetake}
                                    className="w-full py-2 bg-green-700 rounded-lg cursor-pointer hover:bg-green-600 transition"
                                >
                                    Retake
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="w-full py-2 bg-red-600 rounded-lg cursor-pointer hover:bg-red-500 transition"
                                >
                                    Cancel
                                </button>
                            </>
                            ) : (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-2 px-2 bg-green-700 rounded-lg cursor-pointer hover:bg-green-600 transition"
                                >
                                    Upload Another
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                    onChange={handleUploadImage}
                                />
                                <button
                                    onClick={handleCancel}
                                    className="w-full py-2 bg-red-600 rounded-lg cursor-pointer hover:bg-red-500 transition"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>}

            {status === "result" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                            {matches.length > 0
                                ? `${matches.length} match${matches.length > 1 ? "es" : ""} found`
                                : "No matches found"}
                        </p>
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition"
                        >
                            <RotateCcw size={12} /> Search Again
                        </button>
                    </div>

                    {matches.length === 0 && (
                        <div className="rounded-xl p-10 bg-gray-800 border border-gray-700 text-center">
                            <UserX
                                size={48}
                                className="mx-auto text-gray-600"
                            />
                            <p className="mt-3 text-sm text-gray-400">
                                No Image Found
                            </p>
                        </div>
                    )}

                    {matches.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            {matches.map((v, i) => (
                                <div
                                    key={i}
                                    className="relative rounded-xl overflow-hidden border border-gray-700 aspect-square"
                                >
                                    <img
                                        src={v.image}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <a
                                        href={v.image}
                                        download={`face_${v.id}.png`}
                                        className="absolute bottom-2 right-2 bg-gray-800/70 hover:bg-gray-700/80 p-1 rounded-full text-white"
                                        title="Download Image"
                                    >
                                        <Download size={16} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
