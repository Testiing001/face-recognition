import axios from "axios";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import Webcam from "react-webcam";

export type Status = "options" | "scan" | "result";
export type Mode = "capture" | "preview" | null;
export type Source = "camera" | "upload" | null;
export type Show = "viewer" | "gallery" | null;

export interface Match {
    id: number;
    image: string;
    face: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface FaceContextValue {
    status: Status;
    mode: Mode;
    source: Source;
    photo: string | null;
    show: Show;
    error: string;
    matches: Match[];
    currentIndex: number;
    isCameraLoading: boolean;
    isImageLoading: boolean;
    isSearching: boolean;

    webcamRef: React.RefObject<Webcam | null>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;

    handleCamera: () => void;
    handleUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCapturePhoto: () => void;
    handleSearch: (imageData: string) => Promise<void>;
    handleRetake: () => void;
    handleCancel: () => void;
    handleReset: () => void;
    handleFullImage: (i: number) => void;
    setShow: (show: Show) => void;
    setCurrentIndex: (index: number) => void;
    setIsImageLoading: (loading: boolean) => void;
    setIsCameraLoading: (loading: boolean) => void;
    setError: (error: string) => void;
}

const FaceContext = createContext<FaceContextValue | null>(null);

export const FaceProvider = ({ children }: { children: React.ReactNode }) => {
    const [status, setStatus] = useState<Status>("options");
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

    const handleCamera = () => {
        setStatus("scan");
        setMode("capture");
        setIsCameraLoading(true);
    };

    const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError("");
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
        reader.onerror = () => setError("Error reading file");
        reader.readAsDataURL(file);
    };

    const handleCapturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;
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
            setShow("gallery");
            setMatches(res.data.matches);
            setCurrentIndex(0);
        } catch (err: any) {
            const message = err?.response?.data?.detail || err?.message || "Something went wrong";
            setError(message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleRetake = () => {
        setPhoto(null);
        setMode("capture");
        setError("");
        setIsCameraLoading(true);
    };

    const handleCancel = () => {
        setStatus("options");
        setPhoto(null);
        setSource(null);
        setError("");
    };

    const handleReset = () => {
        setStatus("options");
        setMode(null);
        setSource(null);
        setPhoto(null);
        setShow(null);
        setError("");
        setMatches([]);
        setCurrentIndex(0);
    };

    const handleFullImage = (i: number) => {
        setShow("viewer");
        setCurrentIndex(i);
    };

    return (
        <FaceContext.Provider
            value={{
                status, mode, source, photo, show, error,
                matches, currentIndex, isCameraLoading,
                isImageLoading, isSearching,
                webcamRef, fileInputRef,
                handleCamera, handleUploadImage, handleCapturePhoto,
                handleSearch, handleRetake, handleCancel, handleReset,
                handleFullImage, setShow, setCurrentIndex, setIsImageLoading,
                setIsCameraLoading, setError,
            }}
        >
            {children}
        </FaceContext.Provider>
    );
};

export const useFace = () => {
    const context = useContext(FaceContext);
    if (!context) throw new Error("useFace must be used inside FaceProvider");
    return context;
};