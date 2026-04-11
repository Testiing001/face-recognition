import { useAdmin } from "../../context/AdminContext";

export const ViewAll = () => {
    const { photos, deleteMode, activeAction, selected, toggleSelect } = useAdmin();

    const noPhotoMessage = activeAction === "view" ? "No photos in database" : (activeAction === "delete" ? "No photos to delete" : "");

    return (
        <div>
            {activeAction === "view" && <h1 className="text-4xl font-bold text-gray-800 py-5">All Photos</h1>}
            {photos.length > 0 ? ( 
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-5">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            onClick={() => deleteMode && toggleSelect(photo.id)}
                            className={`${deleteMode ? "cursor-pointer" : ""} relative`}
                        >
                            <img src={photo.image} className="rounded-xl object-cover aspect-square" />
                            {deleteMode && (
                                <input
                                    type="checkbox"
                                    readOnly
                                    checked={selected.includes(photo.id)}
                                    className="w-4 h-4 absolute top-2 right-2 accent-blue-500 cursor-pointer"
                                />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {photos.length === 0 &&
                        <>
                            {activeAction === "view" && 
                                <div className="min-h-[75vh] flex items-center justify-center">
                                    <p className="text-gray-400 text-lg font-semibold">{noPhotoMessage}</p>
                                </div>
                            }
                            {activeAction === "delete" && 
                                <div className="h-screen flex items-center justify-center">
                                    <p className="text-gray-400 text-lg font-semibold">{noPhotoMessage}</p>
                                </div>
                            }
                        </>
                    }
                </>
            )}
        </div>
    );
};