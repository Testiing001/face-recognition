import { FaceProvider, useFace } from "../context/HomeContext";
import { Options } from "../components/home/Options";
import { Scan } from "../components/home/Scan";
import { Results } from "../components/home/Results";

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