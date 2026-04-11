import { Trash2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useState } from "react";

export const DeletePhotos = () => {
    const {
        photos, selected, isAllSelected,
        handleDeletePhotos, handleCancel, handleSelectAllChange,
    } = useAdmin();

    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <>
            {photos.length > 0 &&
                <div className="w-full">
                    <p className="text-red-600/90 font-semibold pt-2">Select images to delete</p>
                    <div className="flex justify-between items-center gap-3 pb-2">
                        <label className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAllChange}
                                className="w-4 h-4 accent-blue-500 cursor-pointer"
                            />
                            Select All
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowConfirm(true)}
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
            }
            {showConfirm && (
                <div className="fixed inset-0 flex bg-black/40 items-center justify-center z-10">
                    <div className="bg-white rounded-2xl px-8 py-6 shadow-lg w-md flex flex-col gap-4">
                        <p className="text-gray-800 font-semibold text-lg p-2">Are you sure you want to delete {selected.length} photo{selected.length !== 1 ? "s" : ""}?</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => { setShowConfirm(false); handleDeletePhotos(); }} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer">
                                Yes
                            </button>
                            <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg cursor-pointer">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};