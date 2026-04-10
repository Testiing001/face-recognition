import { useAdmin } from "../../context/AdminContext";

export const ViewAll = () => {
    const { photos, deleteMode, selected, toggleSelect } = useAdmin();

    if (photos.length === 0) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <p className="text-gray-400 text-lg font-semibold">No photos in database</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
                <div
                    key={photo.id}
                    onClick={() => deleteMode && toggleSelect(photo.id)}
                    className="relative rounded-xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-lg transition"
                >
                    <img src={photo.image} className="w-full h-full object-cover aspect-square" />
                    {deleteMode && (
                        <input
                            type="checkbox"
                            readOnly
                            checked={selected.includes(photo.id)}
                            className="w-4 h-4 cursor-pointer absolute top-2 right-2 accent-blue-500"
                        />
                    )}
                </div>
            ))}
        </div>
    );
};