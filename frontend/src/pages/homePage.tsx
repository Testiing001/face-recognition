import axios from "axios";
import { Camera, ChevronLeft, ChevronRight, Download, FolderOpen, ImageIcon, RotateCcw, ScanFace, Search, Upload, UserX, X, XCircle } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

type Status = "idle" | "scan" | "result";
type Mode = "capture" | "preview" | null;
type Source = "camera" | "upload" | null;
type Show = "viewer" | "gallery" | null;

interface Match {
    id: number,
    image: string,
    face: number,
}

export const HomePage = () => {
    const [status, setStatus] = useState<Status>("idle");
    const [mode, setMode] = useState<Mode>(null);
    const [source, setSource] = useState<Source>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [show, setShow] = useState<Show>(null);
    const [error, setError] = useState<string>("");
    const [matches, setMatches] = useState<Match[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCamera = () => {
        setStatus("scan");
        setMode("capture");
    }

    const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = () => {
            const userPhoto = reader.result as string;
            setStatus("scan");
            setMode("preview");
            setPhoto(userPhoto);
            setSource("upload");
            e.target.value = "";
        };

        reader.onerror = () => {
            setError("Error reading file");
        };

        reader.readAsDataURL(file);
    };

    const handleCapturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc)     return;
        setMode("preview");
        setPhoto(imageSrc);
        setSource("camera");
    }, []);

    const handleSearch = async (imageData: string) => {
        setError("");
        try {
            const blob = await fetch(imageData).then((r) => r.blob());
            const form = new FormData();
            form.append("file", blob, "face.jpeg");

            const res = await axios.post("http://localhost:8000/search/", form);

            setStatus("result");
            setMode(null);
            setSource(null);
            setPhoto(null);
            setShow("viewer");
            setMatches(res.data.matches);
            setCurrentIndex(res.data.matches[0]?.image);
        } 
        catch (err: any) {
            setError("error");
        }
    };

    const handleRetake = () => {
        setMode("capture");
        setPhoto(null);
        setError("");
    }

    const handleCancel = () => {
        setStatus("idle");
        setPhoto(null);
        setSource(null);
        setError("");
    }

    const handleReset = () => {
        setStatus("idle");
        setMode(null);
        setSource(null);
        setPhoto(null);
        setShow(null);
        setError("");
        setMatches([]);
        setCurrentIndex(0);
    }

    return (
        <>
            {status === "idle" && 
                <>
                    <h1 className="text-4xl text-center font-semibold text-white my-5">
                        Welcome to Face Recognition System
                    </h1>
                    <div className="w-lg flex mx-auto p-6">
                        <div className="w-full h-[70vh] p-4 bg-white rounded-2xl shadow-lg shadow-gray-700">
                            <div className="flex justify-center items-center text-gray-800 gap-2 text-2xl font-semibold py-3">
                                <ScanFace size={32} /> Scan Your Face
                            </div>
                            <div className="max-w-xs mx-auto flex flex-col justify-center gap-6 py-4">
                                <button onClick={handleCamera} className="flex flex-col items-center gap-2 py-10 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-2xl transition cursor-pointer">
                                    <Camera size={32}/>
                                    <span className="text-sm font-medium">
                                        Use Camera
                                    </span>
                                </button>
                                <button  onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 py-10 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-2xl transition cursor-pointer">
                                    <FolderOpen size={32}/>
                                    <span className="text-sm font-medium">
                                        Upload Image
                                    </span>
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
                            </div>
                        </div>
                    </div>
                </>
            }

            {status === "scan" &&
                <div className="w-lg h-screen mx-auto flex justify-center items-center">
                    <div className="w-full bg-white rounded-2xl px-8 py-3 shadow-lg shadow-gray-700">
                        <div className="mx-auto text-center text-2xl text-gray-700 font-semibold mb-3">Search a Face</div>
                        {mode === "capture" && <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="h-[55vh] rounded-2xl"/>}
                        {mode === "preview" && photo && <img src={photo} alt="Preview" className="h-[55vh] rounded-2xl object-contain"/>}

                        {error && 
                            <div className="w-full flex justify-center items-center gap-1 text-red-800 font-semibold">
                                <XCircle size={15} /> {error}
                            </div>
                        }

                        {mode === "capture" && 
                            <div className="w-sm flex mx-auto mt-3 font-semibold gap-8 text-white">
                                    <button onClick={handleCapturePhoto} className="w-full flex items-center justify-center gap-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer transition">
                                        <ImageIcon size={18} /> Take Photo
                                    </button>
                                    <button onClick={handleCancel} className="w-full flex items-center justify-center gap-1 py-2 bg-red-600 rounded-lg cursor-pointer hover:bg-red-500 transition">
                                        <X size={18} /> Cancel
                                    </button>
                            </div>
                        }

                        {mode === "preview" &&
                            <div className="w-md flex mx-auto mt-3 font-semibold gap-4 text-white">
                                <button onClick={() => photo && handleSearch(photo)} className="flex flex-1 items-center justify-center gap-1 py-2 rounded-lg cursor-pointer bg-indigo-600 hover:bg-indigo-500 transition">
                                    <Search size={16} /> Search
                                </button>
                                {source === "camera" &&
                                    <button onClick={handleRetake} className="flex flex-1 items-center justify-center gap-1 py-2 bg-green-700 rounded-lg cursor-pointer hover:bg-green-600 transition">
                                        <RotateCcw size={16} /> Retake
                                    </button>
                                }
                                {source === "upload" &&
                                    <>
                                        <button onClick={() => fileInputRef.current?.click()} className="flex flex-1.5 px-3 items-center justify-center gap-1 py-2 bg-green-700 rounded-lg cursor-pointer hover:bg-green-600 transition">
                                            <Upload size={16} /> Upload Another
                                        </button>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadImage}/>
                                    </>
                                }
                                <button onClick={handleCancel} className="flex flex-1 items-center justify-center gap-1 py-2 bg-red-600 rounded-lg cursor-pointer hover:bg-red-500 transition">
                                    <X size={16} /> Cancel
                                </button>
                            </div>
                        }
                    </div>
                </div>
            }

            {status === "result" && 
                <>
                    {matches.length === 0 ? (
                        <div className="w-lg mx-auto flex justify-center items-center">
                            <div className="w-full h-[70vh] rounded-2xl px-10 py-4 bg-white shadow-lg shadow-gray-700">
                                <button onClick={handleReset} className="w-full flex justify-end items-center gap-1 mb-4 font-semibold cursor-pointer text-indigo-700 hover:text-indigo-600 transition">
                                    <RotateCcw size={18} /> Search Again
                                </button>
                                <div className="w-full h-[80%] flex flex-col justify-center items-center gap-3 bg-gray-700 rounded-2xl border-3 border-solid border-gray-900">
                                    <UserX size={48} className="text-gray-400"/>
                                    <p className="text-gray-300"> No Results Found</p>
                                </div>
                                <p className="text-center text-gray-700 font-semibold mt-3"> Try uploading a clear image or scan your face again.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {show === "viewer" &&
                                <div className="fixed w-full h-14 top-0 left-0 bg-black/60 z-3">
                                    {matches.length > 1 && <div className="absolute top-4 left-4 text-white mx-6">
                                        Photos: {currentIndex + 1} / {matches.length}
                                    </div>}
                                    <div className="absolute top-4 right-4 flex gap-4">
                                        <a href={matches[currentIndex]?.image} download={`face_${currentIndex + 1}.png`} className="text-white cursor-pointer  hover:scale-110">
                                            <Download size={20} />
                                        </a>
                                        <button onClick={() => setShow("gallery")} className="text-white cursor-pointer hover:scale-110">
                                            <X size={24}/>
                                        </button>
                                    </div>
                                    <div className="flex h-screen justify-between items-center gap-10">
                                        <button>
                                            <ChevronLeft size={64} className="text-gray-300 cursor-pointer hover:text-white hover:scale-110 transition" />
                                        </button>
                                        <img src={matches[currentIndex]?.image} alt={`${matches[currentIndex]?.image}.jpeg`} />
                                        <button>
                                            <ChevronRight size={64} className="text-gray-300 cursor-pointer hover:text-white hover:scale-110 transition" />
                                        </button>
                                    </div>
                                </div>
                            }

                            {show === "gallery" &&
                                <div className="w-[90%] mx-auto px-10 py-6 bg-white rounded-xl shadow-lg shadow-gray-700">
                                    <div className="flex justify-between items-center">
                                        <p className="text-4xl text-gray-700 text-semibold">Your Photos</p>
                                        <div>
                                            <button onClick={handleReset} className="flex gap-1 items-center text-lg font-semibold cursor-pointer text-indigo-700 hover:text-indigo-600 transition">
                                                <RotateCcw size={18} /> Search Again
                                            </button>
                                        </div>
                                    </div>
                                    <div className="my-4 grid grid-cols-4 gap-2">
                                        {matches.map((v, i) => (
                                            <div key={i} className="rounded-xl">
                                                <img src={v?.image} alt={`${v?.image}.jpeg`} className="object-contain"/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            }
                        </>
                    )}
                </>
            }
        </>
    );
}
