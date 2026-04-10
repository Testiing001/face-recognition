import { useAdmin } from "../../context/AdminContext";

export const FaceGroups = () => {
    const { faceGroups, handleGroupClick } = useAdmin();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
    );
};