import { useAdmin } from "../../context/AdminContext";

export const FaceGroups = () => {
    const { faceGroups } = useAdmin();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-4 gap-4">
            {faceGroups.map((group, i) => (
                <div
                    key={i}
                    className="rounded-xl overflow-hidden hover:scale-105 transition cursor-pointer shadow-sm"
                >
                    <img src={group.thumbnail} className="w-full h-full object-cover aspect-square" />
                </div>
            ))}
        </div>
    );
};