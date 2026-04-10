import { useAdmin } from "../../context/AdminContext";

export const FaceGroups = () => {
    const { photos, faceGroups, handleGroupClick } = useAdmin();

    return (
        <>
            {photos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6 mb-4 gap-4">
                    {faceGroups.map((group) => (
                        <div
                            key={group.group_id}
                            onClick={() => handleGroupClick(group.group_id)}
                            className="rounded-xl overflow-hidden hover:scale-105 transition cursor-pointer shadow-sm"
                        >
                            <img src={group.thumbnail} className="w-full h-full object-cover aspect-square" />
                            <div className="px-3 py-2 bg-white">
                                <p className="text-sm text-gray-500">{group.total_photos} photo{group.total_photos !== 1 ? "s" : ""}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-[80vh]">
                    <p className="text-gray-400 text-lg font-semibold">No Faces Groups to show</p>
                </div>
            )}
        </>
    );
};