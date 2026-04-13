import { Menu, X, LogOut, ImageIcon, Users, UploadCloud, Loader } from "lucide-react";
import { AdminProvider, useAdmin } from "../context/AdminContext";
import { ViewAll } from "../components/admin/ViewAll";
import { FaceGroups } from "../components/admin/FaceGroups";
import { GroupPhotos } from "../components/admin/GroupPhotos";

const AdminPageInner = () => {
    const {
        adminProfile, activeTab, error, isLoading, fileInputRef, 
        selectedGroup, sidebarOpen, handleViewAll, handleFaceGroups, 
        handleUpload, handleUploadPhotos, handleLogout, setSidebarOpen,
    } = useAdmin();

    return (
        <>
            <div className="md:hidden fixed left-0 top-0 right-0 px-3 py-3 bg-gray-900 text-white z-3">
                <button onClick={() => setSidebarOpen(true)} className="cursor-pointer">
                    <Menu/>
                </button>
            </div>
            <div className="flex h-screen overflow-hidden">
                <div
                    className={`
                        fixed md:static w-3xs min-h-screen z-3 bg-gray-900 text-white p-4 
                        flex flex-col justify-between transform transition-transform duration-300
                        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                    `}
                >
                    <div className="md:hidden flex justify-end mb-">
                        <button onClick={() => setSidebarOpen(false)} className="cursor-pointer">
                            <X />
                        </button>
                    </div>
                    <div>
                        <div className="mb-6 mx-3">
                            <p className="text-xl font-semibold">{adminProfile?.fullname}</p>
                            <p className="text-sm text-gray-400 mb-1">@{adminProfile?.username}</p>
                            <p className="text-sm text-gray-400">{adminProfile?.email}</p>
                        </div>

                        <hr className="border-gray-700 mb-4" />

                        <div className="flex flex-col gap-2">
                            <button onClick={handleViewAll} className={`text-left px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 cursor-pointer ${activeTab === "all" ? "bg-gray-800" : ""}`}>
                                <ImageIcon size={16} /> All Photos
                            </button>
                            <button onClick={handleFaceGroups} className={`text-left px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 cursor-pointer ${activeTab === "groups" ? "bg-gray-800" : ""}`}>
                                <Users size={16} /> Face Groups
                            </button>
                            <button onClick={handleUpload} className={`text-left px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 cursor-pointer ${activeTab === "upload" ? "bg-gray-800" : ""}`}>
                                <UploadCloud size={16} /> Upload Photos
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
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 md:hidden z-2"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                <div className="flex-1 overflow-y-auto px-6">
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                    {(isLoading) && (
                        <div className="min-h-screen flex justify-center items-center gap-1">
                            <p className="text-gray-500 text-lg font-semibold">
                                {activeTab === "all" 
                                    ? "Loading photos" 
                                    : activeTab === "groups" 
                                        ? "Loading groups" 
                                        : "Uploading photos"
                                }
                            </p>
                            {(activeTab === "all" || activeTab === "groups") 
                                ? <Loader size={24} className="animate-spin text-gray-500" />
                                : <UploadCloud size={28} className="animate-[bounce_3s_ease-out_infinite] text-gray-500 mt-2" />
                            }
                        </div>
                    )}

                    {activeTab === "all" && !isLoading && <ViewAll />}
                    
                    {activeTab === "groups" && !isLoading && (
                        selectedGroup ? <GroupPhotos /> : <FaceGroups />
                    )}
                </div>
            </div>
        </>
    );
};

export const AdminPage = () => (
    <AdminProvider>
        <AdminPageInner />
    </AdminProvider>
);