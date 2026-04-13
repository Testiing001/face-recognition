import { Trash2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { ConfirmModal } from "./ConfirmModal";
import { DeletePhotos } from "./DeletePhotos";

export const ViewAll = () => {
    const { 
        photos, activeAction, deleteMode, showConfirm, setShowConfirm, 
        selected, toggleSelect, setSelected, hoveredPhoto, setHoveredPhoto,
        fetchPhotos, page, totalPages,
    } = useAdmin();

    return (
        <div>
            {activeAction === "view" && <h1 className="mt-3 mb-1 text-3xl font-bold text-gray-800">All Photos</h1>}
            {photos.length > 0 ? ( 
                <>
                    <DeletePhotos />
                    <div className="min-h-[75vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo) => (
                            <div
                                key={photo.id}
                                onClick={() => deleteMode && toggleSelect(photo.id)}
                                className={`${deleteMode && selected.includes(photo.id) ? "ring-5 scale-96 ring-blue-600/55 rounded-xl transition-all duration-200 cursor-pointer" : `${deleteMode ? "cursor-pointer hover:scale-103 transition-all duration-200" : ""}`} relative`}
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
                    <div className="flex justify-center fixed sticky items-center bottom-0 py-2 bg-white gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => fetchPhotos(page - 1)}
                            className={`${page === 1 ? "cursor-not-allowed" : "hover:bg-gray-300 cursor-pointer"} px-4 py-1 bg-gray-200 rounded disabled:opacity-60`}
                        >
                            Prev
                        </button>
                        <span className="px-3 py-1">
                            {page} / {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => fetchPhotos(page + 1)}
                            className={`${page === totalPages ? "cursor-not-allowed" : "hover:bg-gray-300 cursor-pointer"} px-3 py-1 bg-gray-200 rounded disabled:opacity-50`}
                        >
                            Next
                        </button>
                    </div>
                    {showConfirm && <ConfirmModal />}
                </>
            ) : (
                <>
                    {photos.length === 0 && activeAction === "view" && 
                        <div className="min-h-[75vh] flex items-center justify-center">
                            <p className="text-gray-500 text-lg font-semibold">No photos in database</p>
                        </div>
                    }
                </>
            )}
        </div>
    );
};