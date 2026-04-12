import { useAdmin } from "../../context/AdminContext";
export const FaceGroups = () => {
    const { photos, faceGroups, isGroupLoading, handleGroupPhotos } = useAdmin();

    return (
        <>
            {!isGroupLoading && 
                <>
                    <h1 className="my-3 text-3xl font-bold text-gray-800">Face Groups</h1>
                    {photos.length > 0 ? (
                        <>
                            <p className="font-semibold text-gray-500">Select a group to view matching photos</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-4 gap-5">
                                {faceGroups.map((group) => {
                                    const [x1, y1, x2, y2] = group.bbox;

                                    const faceWidth = x2 - x1;
                                    const faceHeight = y2 - y1;

                                    const targetSize = 80;
                                    const scale = targetSize / Math.max(faceWidth, faceHeight);

                                    return (
                                        <div
                                            key={group.group_id}
                                            onClick={() => handleGroupPhotos(group.group_id)}
                                            className="p-3 rounded-xl bg-gray-100/70 shadow-lg hover:scale-103 transition cursor-pointer flex flex-col items-center"
                                        >
                                            <div className="w-40 h-40 rounded-full overflow-hidden relative bg-gray-200">
                                            `    <img
                                                    src={group.thumbnail}
                                                    className="absolute max-w-none"
                                                    style={{
                                                        left: `-${x1 * scale - 50}px`,
                                                        top: `-${y1 * scale - 30}px`,
                                                        transform: `scale(${scale})`,
                                                        transformOrigin: "top left",
                                                    }}
                                                />`
                                            </div>
                                            <p className="mt-3 text-sm font-medium">
                                                {group.total_photos} Photos
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center min-h-[80vh]">
                            <p className="text-gray-500 text-lg font-semibold">No Face Groups to show</p>
                        </div>
                    )}
                </>
            }
        </>
    );
};