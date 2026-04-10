import { FaceProvider, useFace } from "../context/FaceContext";
import { Options } from "../components/Options";
import { Scan } from "../components/Scan";
import { Results } from "../components/Results";

const HomePageInner = () => {
    const { status, fileInputRef, handleUploadImage } = useFace();

    return (
        <>
            {status === "options" && <Options />}
            {status === "scan" && <Scan />}
            {status === "result" && <Results />}

            <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleUploadImage}
            />
        </>
    );
};

export const HomePage = () => (
    <FaceProvider>
        <HomePageInner />
    </FaceProvider>
);