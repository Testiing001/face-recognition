import { useAdmin } from "../../context/AdminContext";

export const ViewAll = () => {
    const { photos, deleteMode, activeAction, selected, toggleSelect } = useAdmin();

    const noPhotoMessage = activeAction === "view" ? "No photos in database" : (activeAction === "delete" ? "No photos to delete" : "");

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            {photos.length === 0 &&
                <div className="flex items-center justify-center h-[80vh]">
                    <p className="text-gray-400 text-lg font-semibold">{noPhotoMessage}</p>
                </div>
            }
        </>
    );
};