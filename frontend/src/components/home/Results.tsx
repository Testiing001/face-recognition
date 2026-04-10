import { useFace } from "../../context/HomeContext";
import { Gallery } from "./Gallery";
import { Viewer } from "./Viewer";
import { NoResults } from "./NoResults";

export const Results = () => {
    const { matches, show } = useFace();

    if (matches.length === 0) return <NoResults />;

    return (
        <>
            {show === "viewer" && <Viewer />}
            {show === "gallery" && <Gallery />}
        </>
    );
};