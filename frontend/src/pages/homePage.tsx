import axios from "axios";
import { Camera, ChevronLeft, ChevronRight, Download, FolderOpen, ImageIcon, Maximize, RotateCcw, ScanFace, Search, Upload, UserX, X, XCircle } from "lucide-react";
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const HomePage = () => {
    const [status, setStatus] = useState<Status>("idle");
    const [mode, setMode] = useState<Mode>(null);
    const [source, setSource] = useState<Source>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [show, setShow] = useState<Show>(null);
    const [error, setError] = useState<string>("");
    const [matches, setMatches] = useState<Match[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCamera = async () => {
        setStatus("scan");
        setMode("capture");
        setIsCameraLoading(true); 
    };

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
        setIsSearching(true);

        try {
            const blob = await fetch(imageData).then((r) => r.blob());
            const form = new FormData();
            form.append("file", blob, "face.jpeg");

            const res = await axios.post(`${BACKEND_URL}/search/`, form);

            setStatus("result");
            setMode(null);
            setSource(null);
            setPhoto(null);
            setShow("viewer");
            setMatches(res.data.matches);
            setCurrentIndex(0);
        } 
        catch (err: any) {
            const message = err?.response?.data?.detail || err?.message || "Something went wrong";
            setError(message);
        }
        finally {
            setIsSearching(false);
        }
    };

    const handleRetake = () => {
        setPhoto(null);
        setMode("capture");
        setError("");
        setIsCameraLoading(true);
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
    
    const handleFullImage = (i: number) => {
        setShow("viewer");
        setCurrentIndex(i);
    }

    return (
        <>
            {status === "idle" && 
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
                            </div>
                        </div>
                    </div>
                </>
            }

            {status === "scan" &&
                <div className="w-lg h-screen mx-auto flex justify-center items-center">
                    <div className="w-full bg-white rounded-2xl px-8 py-3 shadow-lg shadow-gray-700 relative">
                        <div className="mx-auto text-center text-2xl text-gray-700 font-semibold mb-3">Search a Face</div> 
                        {mode === "capture" && (     
                            <div className="relative h-[55vh] w-full rounded-xl bg-gray-100 overflow-hidden">
                                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" onUserMedia={() => setIsCameraLoading(false)} 
                                    onUserMediaError={() => {setIsCameraLoading(false); setError("Camera access denied");}}/>
                                {isCameraLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                        <div className="w-10 h-10 border-4 border-gray-800/40 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="font-semibold text-gray-700">Opening Camera...</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {mode === "preview" && photo && <img src={photo} alt="Preview" className="h-[55vh] mx-auto rounded-xl object-contain"/>}

                        {error && 
                            <div className="flex justify-center items-center mt-1 gap-1 text-sm text-red-800 font-semibold">
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
                                <button disabled={isSearching} onClick={() => photo && handleSearch(photo)} className="flex flex-1 items-center justify-center gap-1 py-2 rounded-lg cursor-pointer bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
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
                                    </>
                                }
                                <button onClick={handleCancel} className="flex flex-1 items-center justify-center gap-1 py-2 bg-red-600 rounded-lg cursor-pointer hover:bg-red-500 transition">
                                    <X size={16} /> Cancel
                                </button>
                            </div>
                        }
                        {isSearching && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl z-5">
                                <div className="flex flex-col items-center gap-3 text-white">
                                    <div className="w-10 h-10 text-gray-700 border-5 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="font-semibold text">Searching your face...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            }

            {status === "result" && 
                <>
                    {matches.length === 0 ? (
                        <div className="w-lg h-screen mx-auto flex justify-center items-center">
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
                                <div className="bg-black/70">
                                    <div className="fixed w-full h-14 top-0 left-0 bg-black/50 z-3">
                                        {matches.length > 1 && 
                                            <div className="absolute top-4 left-4 text-white mx-6">
                                                Photos: {currentIndex + 1} / {matches.length}
                                            </div>
                                        }
                                        <div className="absolute top-4 right-4 flex gap-4">
                                            <a href={matches[currentIndex]?.image} download={`face_${currentIndex + 1}.jpeg`} className="text-gray-100 hover:text-white cursor-pointer hover:scale-120 transition-transform">
                                                <Download size={22} />
                                            </a>
                                            <button onClick={() => setShow("gallery")} className="text-gray-100 hover:text-white cursor-pointer hover:scale-120 transition-transform">
                                                <X size={26}/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative flex w-full h-screen justify-between items-center">
                                        <button onClick={()=>setCurrentIndex(currentIndex - 1)} disabled={currentIndex == 0} className="text-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:hover:text-gray-300 hover:text-white transition">
                                            <ChevronLeft size={64} />
                                        </button>
                                        <img src={`${matches[currentIndex]?.image}`} alt={`${currentIndex + 1}.jpeg`} onLoad={() => setIsImageLoading(false)}
                                            onLoadStart={() => setIsImageLoading(true)} className="h-screen object-contain" />
                                        <button onClick={()=>setCurrentIndex(currentIndex + 1)} disabled={currentIndex === matches.length - 1} className="text-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:hover:text-gray-300 hover:text-white transition">
                                            <ChevronRight size={64} />
                                        </button>
                                        {isImageLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-5">
                                                <div className="flex flex-col items-center gap-2 text-white">
                                                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <p className="font-semibold">Loading image...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            }

                            {show === "gallery" &&
                                <div className="h-screen py-5 px-8">
                                    <div className="h-full px-10 pt-6 pb-3 bg-white rounded-xl shadow-lg shadow-gray-500">
                                        <div className="flex justify-between items-center">
                                            <p className="text-4xl text-gray-700 text-semibold">Your Photos</p>
                                            <button onClick={handleReset} className="flex gap-1 items-center text-lg font-semibold cursor-pointer text-indigo-700 hover:text-indigo-500 transition">
                                                <RotateCcw size={18} /> Search Again
                                            </button>   
                                        </div>
                                        <div className="my-4 grid grid-cols-4 gap-4">
                                            {matches.map((v, i) => (
                                                <div key={v.id} className="mb-2">
                                                    <div className="relative group transition-transform duration-300 hover:scale-103">
                                                        <img src={v?.image} alt={`${v?.image}.jpeg`}
                                                            className="relative rounded-xl transition-transform duration-300"/>
                                                        <div onClick={() => handleFullImage(i)} className="absolute inset-0 flex justify-center items-center hover:bg-black/10 rounded-xl cursor-pointer">
                                                            <Maximize size={24} className="text-white opacity-0 group-hover:opacity-100 transition" />
                                                        </div>
                                                    </div>
                                                    <div className="flex mx-3 justify-between mt-1.5">
                                                        <p className="text-gray-800 font-semibold">{`Face-${i + 1}.jpeg`}</p>
                                                        <a href={v.image} download={`Face_${i + 1}.jpeg`}
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
                            }
                        </>
                    )}
                </>
            }
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadImage}/>
        </>
    );
}
