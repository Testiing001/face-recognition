import { Trash2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { ConfirmModal } from "./ConfirmModal";
import { DeletePhotos } from "./DeletePhotos";

export const ViewAll = () => {
    const { 
        photos, activeAction, deleteMode, showConfirm, setShowConfirm, 
        selected, toggleSelect, setSelected, hoveredPhoto, setHoveredPhoto,
    } = useAdmin();
    
    const noPhotoMessage = activeAction === "view" ? "No photos in database" : (activeAction === "delete" ? "No photos to delete" : "");

    return (
        <div>
            {activeAction === "view" && <h1 className="mt-3 mb-1 text-3xl font-bold text-gray-800">All Photos</h1>}
            {photos.length > 0 ? ( 
                <>
                    <DeletePhotos />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                        {photos.map((photo) => (
                            <div
                                key={photo.id}
                                onClick={() => deleteMode && toggleSelect(photo.id)}
                                className={`${deleteMode ? "cursor-pointer" : ""} relative`}
                                onMouseEnter={() => setHoveredPhoto(photo.id)}
                                onMouseLeave={() => setHoveredPhoto(null)}
                            >
                                <img src={photo.image} className="rounded-xl object-cover aspect-square" />
                                {!deleteMode && hoveredPhoto === photo.id && (
                                    <button
                                        onClick={(e) => {e.stopPropagation(); setSelected([photo.id]); setShowConfirm(true)}}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-2 cursor-pointer rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    )}
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
                    {showConfirm && <ConfirmModal />}
                </>
            ) : (
                <>
                    {photos.length === 0 && activeAction === "view" && 
                        <div className="min-h-[75vh] flex items-center justify-center">
                            <p className="text-gray-500 text-lg font-semibold">{noPhotoMessage}</p>
                        </div>
                    }
                </>
            )}
        </div>
    );
};