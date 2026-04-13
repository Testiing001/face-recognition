import { Trash2, X } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export const DeletePhotos = () => {
    const {
        view, photos, deleteMode, setDeleteMode, isAllSelected, 
        handleSelectAllChange, selectedGroup, setShowConfirm, selected, handleCancel
    } = useAdmin()

    return (
        <>
            {photos.length > 0 &&
                <>
                    {deleteMode ? (  
                        <div className="flex justify-between items-center gap-3 mb-4 font-semibold text-gray-700">
                            <p className="text-lg text-gray-700">{selected.length} Selected</p>
                            <div className="flex gap-3">
                                <label className="flex items-center text-lg gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAllChange}
                                        className="w-4 h-4 accent-blue-500 cursor-pointer"
                                    />
                                    Select All
                                </label>
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    disabled={selected.length === 0}
                                    className={`px-3 py-1.5 flex justify-center items-center gap-1 rounded-lg text-white
                                        ${selected.length
                                            ? "bg-red-600 hover:bg-red-500 cursor-pointer" 
                                            : "bg-red-800 cursor-not-allowed" 
                                        }`
                                    }
                                >
                                    <Trash2 size={16} />
                                    <span className="hidden sm:inline">
                                        Delete {selected.length > 0 ? `(${selected.length})` : ""}
                                    </span>
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-3 py-1.5 flex justify-center items-center bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-lg text-gray-900">
                                    <X size={16} />
                                    <span className="hidden sm:inline">
                                        Cancel
                                    </span>
                            </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center text-lg gap-2 mt-2 mb-5 font-semibold text-gray-700">
                            <p>
                                {view === "all"
                                    ? `${photos.length} ${photos.length > 1 ? "Photos" : "Photo"}`
                                    : `${selectedGroup?.count} ${selectedGroup?.count ?? 0 > 1 ? "Photos" : "Photo"}`
                                }
                            </p>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    onClick={() => setDeleteMode(true)}
                                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                                />
                                Select Photos
                            </label>
                        </div>
                    )}
                </>
            }
        </>
    );
}