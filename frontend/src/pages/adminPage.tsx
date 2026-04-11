import { LogOut, Trash2, ImageIcon, Users, UploadCloud } from "lucide-react";
import { AdminProvider, useAdmin } from "../context/AdminContext";
import { ViewAll } from "../components/admin/ViewAll";
import { FaceGroups } from "../components/admin/FaceGroups";
import { DeletePhotos } from "../components/admin/DeletePhotos";
import { GroupDetail } from "../components/admin/GroupDetail";

const AdminPageInner = () => {
    const {
        adminProfile, view, activeAction, deleteMode, error, photos, 
        isLoading, isUploading, fileInputRef, selectedGroup,
        handleViewAll, handleFaceGroups, handleUpload,
        handleDelete, handleUploadPhotos, handleLogout,
    } = useAdmin();

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="w-3xs bg-gray-900 text-white p-4 flex flex-col justify-between flex-shrink-0">
                <div>
                    <div className="mb-6 mx-3">
                        <p className="text-xl font-semibold">{adminProfile?.fullname}</p>
                        <p className="text-sm text-gray-400 mb-1">@{adminProfile?.username}</p>
                        <p className="text-sm text-gray-400">{adminProfile?.email}</p>
                    </div>

                    <hr className="border-gray-700 mb-4" />

                    <div className="flex flex-col gap-2">
                        <button onClick={handleViewAll} className={`text-left px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 cursor-pointer ${activeAction === "view" ? "bg-gray-800" : ""}`}>
                            <ImageIcon size={16} /> View All Photos
                        </button>
                        <button onClick={handleFaceGroups} className={`text-left px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 cursor-pointer ${activeAction === "faces" ? "bg-gray-800" : ""}`}>
                            <Users size={16} /> Face Groups
                        </button>
                        <button onClick={handleUpload} className={`text-left px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 cursor-pointer ${activeAction === "upload" ? "bg-gray-800" : ""}`}>
                            <UploadCloud size={16} /> Upload Photos
                        </button>
                        <button onClick={handleDelete} className={`text-left px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 cursor-pointer text-white ${activeAction === "delete" ? "bg-gray-800" : ""}`}>
                            <Trash2 size={16} /> Delete Photos
                        </button>
                        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUploadPhotos} />
                    </div>
                </div>

                <div className="mt-auto">
                    <hr className="border-gray-700 mb-4" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-700 cursor-pointer">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                {photos.length > 0 && deleteMode && <DeletePhotos />}

                {(isLoading || isUploading) && (
                    <div className="h-screen flex justify-center items-center">
                        <p className="text-gray-500 text-lg text-center font-semibold">
                            {isUploading ? "Uploading photos..." : "Loading photos..."}
                        </p>
                    </div>
                )}

                {view === "all" && !isLoading && !isUploading && <ViewAll />}
                
                {view === "group" && !isLoading && (
                    selectedGroup ? <GroupDetail /> : <FaceGroups />
                )}
            </div>
        </div>
    );
};

export const AdminPage = () => (
    <AdminProvider>
        <AdminPageInner />
    </AdminProvider>
);