import Webcam from "react-webcam";
import { useFace } from "../../context/HomeContext";

export const CameraCapture = () => {
    const { webcamRef, isCameraLoading, setIsCameraLoading, setError } = useFace();

    return (
        <div className="relative h-[55vh] w-full rounded-xl bg-gray-100 overflow-hidden">
            <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                onUserMedia={() => setIsCameraLoading(false)}
                onUserMediaError={() => {
                    setIsCameraLoading(false);
                    setError("Camera access denied");
                }}
            />
            
            {isCameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-gray-800/40 border-t-transparent rounded-full animate-spin" />
                    <p className="font-semibold text-gray-700">Opening Camera...</p>
                </div>
            )}
        </div>
    );
};