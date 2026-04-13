import { useAdmin } from "../../context/AdminContext";

export const ConfirmModal = () => {
    const { selected, handleConfirmDelete } = useAdmin();

    return (
        <div className="fixed inset-0 flex bg-black/40 items-center justify-center z-10">
            <div className="bg-white rounded-2xl px-8 py-6 shadow-lg w-md flex flex-col gap-4">
                <p className="text-gray-800 font-semibold text-lg p-2">Are you sure you want to delete {selected.length} photo{selected.length !== 1 ? "s" : ""}?</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={() => handleConfirmDelete(true)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer">
                        Yes
                    </button>
                    <button onClick={() => handleConfirmDelete(false)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg cursor-pointer">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}