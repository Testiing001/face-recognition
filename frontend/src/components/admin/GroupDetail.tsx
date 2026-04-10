import { ArrowLeft } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export const GroupDetail = () => {
    const { selectedGroup, isGroupLoading, handleBackToGroups } = useAdmin();

    if (isGroupLoading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <p className="text-gray-500 text-lg">Loading photos...</p>
            </div>
        );
    }

    if (!selectedGroup) return null;

    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={handleBackToGroups}
                    className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-semibold cursor-pointer transition"
                >
                    <ArrowLeft size={18} /> Back
                </button>
                <p className="text-gray-500 text-sm">{selectedGroup.total_photos} photo{selectedGroup.total_photos !== 1 ? "s" : ""}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedGroup.images.map((img) => (
                    <div key={img.id} className="rounded-xl overflow-hidden shadow-sm hover:scale-105 transition">
                        <img src={img.image} className="w-full h-full object-cover aspect-square" />
                    </div>
                ))}
            </div>
        </div>
    );
};