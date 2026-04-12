import { ArrowLeft, Trash2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { DeletePhotos } from "./DeletePhotos";
import { ConfirmModal } from "./ConfirmModal";

export const GroupPhotos = () => {
    const { 
        selectedGroup, handleBackToGroups, deleteMode, toggleSelect, hoveredPhoto, 
        setHoveredPhoto,selected, setSelected, showConfirm, setShowConfirm,
    } = useAdmin();

    if (!selectedGroup)     return null;

    return (
        <> 
            <button
                onClick={handleBackToGroups}
                className="flex items-center gap-1 my-1 ml-[-16px] text-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 px-2 py-1 rounded-xl hover:scale-105 font-semibold cursor-pointer transition"
            >
                <ArrowLeft size={22} /> Back
            </button>
            <DeletePhotos />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-4">
                {selectedGroup.photos?.map((photo) => (
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
    );
};