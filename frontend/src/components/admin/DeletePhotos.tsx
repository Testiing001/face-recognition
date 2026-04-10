import { Trash2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export const DeletePhotos = () => {
    const {
        photos, selected, isAllSelected,
        handleDeletePhotos, handleCancel, handleSelectAllChange,
    } = useAdmin();

    return (
        <div className="w-full mx-3">
            <p className="text-red-600/90 font-semibold">Select images to delete</p>
            <div className="flex justify-between items-center gap-3">
                {photos.length > 0 && (
                    <label className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAllChange}
                            className="w-4 h-4 accent-blue-500 cursor-pointer"
                        />
                        Select All
                    </label>
                )}
                <div className="flex gap-2">
                    <button
                        onClick={handleDeletePhotos}
                        disabled={selected.length === 0}
                        className={`px-3 py-2 flex items-center gap-1 rounded-lg text-white ${
                            selected.length
                                ? "bg-red-600 hover:bg-red-500 cursor-pointer"
                                : "bg-red-800 cursor-not-allowed"
                        }`}
                    >
                        <Trash2 size={16} />
                        Delete {selected.length > 0 ? `(${selected.length})` : ""}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-lg text-gray-900"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};