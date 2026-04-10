import { ArrowLeft } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export const GroupDetail = () => {
    const { selectedGroup, isGroupLoading, handleBackToGroups } = useAdmin();

    if (!selectedGroup)     return null;

    return (
        <>
            {isGroupLoading ? (
                <div className="flex items-center justify-center h-[80vh]">
                    <p className="text-gray-500 text-lg">Loading photos...</p>
                </div>
            ) : (
                <>
                    <button
                        onClick={handleBackToGroups}
                        className="flex items-center gap-1 mt-2 text-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 px-2 py-1 rounded-xl hover:scale-105 font-semibold cursor-pointer transition"
                    >
                        <ArrowLeft size={22} /> Back
                    </button>
                    <p className="text-gray-600 my-1 mx-2 text-lg">{selectedGroup.total_photos} photo{selectedGroup.total_photos !== 1 ? "s" : ""}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-2">
                        {selectedGroup.images.map((img) => (
                            <img key={img.id} src={img.image} className="rounded-xl object-cover aspect-square" />
                        ))}
                    </div>
                </>
            )}
        </>
    );
};