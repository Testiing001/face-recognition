import { useAdmin } from "../../context/AdminContext";

export const FaceGroups = () => {
    const { photos, faceGroups, handleGroupClick } = useAdmin();

    return (
        <>
            <h1 className="my-5 text-4xl font-bold text-gray-800">Face Groups</h1>
            {photos.length > 0 ? (
                <>
                    <p className="font-semibold text-gray-500 my-1">Select a group to view matching photos</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6 mb-4 gap-4">
                        {faceGroups.map((group) => (
                            <div
                                key={group.group_id}
                                onClick={() => handleGroupClick(group.group_id)}
                                className="hover:scale-105 transition cursor-pointer bg-gray-100/70 shadow-lg overflow-hidden rounded-xl shadow-gray-400"
                            >
                                <img src={group.thumbnail} className="object-cover aspect-square" />
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-[75vh]">
                    <p className="text-gray-400 text-lg font-semibold">No Face Groups to show</p>
                </div>
            )}
        </>
    );
};