import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut, Trash2, ImageIcon, Users, UploadCloud } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface ImageItem {
    id: number;
    image: string;
}

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const AdminPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [username, setUsername] = useState("");
    const [images, setImages] = useState<ImageItem[]>([]);
    const [faceGroups, setFaceGroups] = useState<any[]>([]);
    const [view, setView] = useState<"all" | "faces">("all");
    const [activeAction, setActiveAction] = useState<"view" | "faces" | "upload" | "delete">("view");
    const [deleteMode, setDeleteMode] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setUsername(decoded.sub);
            } catch {
                setUsername("Admin");
            }
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setError("");
        setIsLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/admin/view/`, {
                headers: getAuthHeaders(),
            });
            setImages(res.data.faces);
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFaceGroups = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/admin/face-groups/`, {
                headers: getAuthHeaders(),
            });
            setFaceGroups(res.data.groups);
        } catch {
            setError("Failed to load face groups");
        }
    };

    const handleAuthError = (err: any) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/adminlogin");
        } else {
            setError("Something went wrong");
        }
    };

    const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setError("");
        setIsUploading(true);
        setUploadProgress({});
        setActiveAction("upload");

        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));

        try {
            await axios.post(`${BACKEND_URL}/admin/upload/`, formData, {
                headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total || 1;
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
                    setUploadProgress({ overall: percentCompleted });
                },
            });
            await fetchImages();
            setView("all");
            setActiveAction("view");
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setIsUploading(false);
            setUploadProgress({});
            e.target.value = "";
        }
    };

    const handleDelete = async () => {
        if (selected.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selected.length} photo(s)?`)) return;

        try {
            await axios.delete(`${BACKEND_URL}/admin/delete/`, {
                headers: getAuthHeaders(),
                data: selected,
            });
            setImages((prev) => prev.filter((img) => !selected.includes(img.id)));
            setSelected([]);
            setDeleteMode(false);
            setActiveAction("view");
        } catch (err: any) {
            handleAuthError(err);
        }
    };

    const handleCancel = () => {
        setSelected([]);
        setDeleteMode(false);
        setView("all");
        setActiveAction("view");
    }

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const isAllSelected = images.length > 0 && selected.length === images.length;
    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelected(e.target.checked ? images.map((img) => img.id) : []);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/adminlogin");
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="w-64 bg-gray-900 text-white p-4 flex flex-col justify-between flex-shrink-0">
                <div>
                    <div className="mb-6 mx-3">
                        <p className="text-xl font-semibold">{username}</p>
                        <p className="text-sm text-gray-400">Admin</p>
                    </div>
                    <hr className="border-gray-700 mb-4" />
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => { setView("all"); setError(""); setActiveAction("view"); fetchImages(); setDeleteMode(false); }}
                            className={`text-left px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 cursor-pointer ${activeAction === "view" ? "bg-gray-800" : ""}`}
                        >
                            <ImageIcon size={16} /> View All Photos
                        </button>
                        <button
                            onClick={() => { setView("faces"); fetchFaceGroups(); setError(""); setActiveAction("faces"); setDeleteMode(false); }}
                            className={`text-left px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 cursor-pointer ${activeAction === "faces" ? "bg-gray-800" : ""}`}
                        >
                            <Users size={16} /> Face Categories
                        </button>
                        <button
                            onClick={() => {fileInputRef.current?.click(); setDeleteMode(false);}}
                            className={`text-left px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 cursor-pointer ${activeAction === "upload" ? "bg-gray-800" : ""}`}
                        >
                            <UploadCloud size={16} /> Upload Photos
                        </button>
                        <button
                            onClick={() => { setDeleteMode(true); setSelected([]); setError(""); setActiveAction("delete"); setView("all"); }}
                            className={`text-left px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 cursor-pointer text-white ${activeAction === "delete" ? "bg-gray-800" : ""}`}
                        >
                            <Trash2 size={16} /> Delete Photos
                        </button>

                        <input ref={fileInputRef} type="file" multiple accept="image/*"
                            className="hidden" onChange={handleUploadImages} />
                    </div>
                </div>

                <div className="mt-auto">
                    <hr className="border-gray-700 mb-4" />
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-red-500 cursor-pointer">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white text-gray-900 overflow-y-auto relative px-6">
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <div className="min-h-[80px] mx-3 flex justify-between items-center">
                {deleteMode && view === "all" && (
                    <div className="w-full mx-3">
                        <p className="text-red-600/90 font-semibold">Select images to delete</p>
                        <div className="flex justify-between items-center gap-3">
                            {images.length > 0 && (
                                <label className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAllChange}
                                        className="w-4 h-4 accent-blue-500 cursor-pointer"
                                    />
                                    Select All
                                </label>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={selected.length === 0}
                                    className={`px-3 py-2 flex items-center gap-1 rounded-lg text-white ${
                                        selected.length
                                            ? "bg-red-600 hover:bg-red-500 cursor-pointer"
                                            : "bg-red-800 cursor-not-allowed"
                                    }`}
                                >
                                    <Trash2 size={16} /> Delete {selected.length > 0 ? `(${selected.length})` : ""}
                                </button>
                                <button onClick={handleCancel} className="px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-gray-900">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                </div>

                {(isLoading || isUploading) && (
                    <div className="flex items-center justify-center h-screen">
                        <p className="text-gray-500 text-lg">
                            {isUploading ? `Uploading photos... (${uploadProgress.overall || 0}%)` : "Loading photos..."}
                        </p>
                    </div>
                )}

                {view === "all" && !isLoading && !isUploading && (
                    images.length === 0 ? (
                        <div className="flex items-center justify-center h-screen">
                            <p className="text-gray-400 text-lg font-semibold">No photos in database</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    className="relative rounded-xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-lg transition"
                                    onClick={() => deleteMode && toggleSelect(img.id)}
                                >
                                    <img src={img.image} className="w-full h-full object-cover aspect-square" />
                                    {deleteMode && ( 
                                        <input type="checkbox" className="w-4 h-4 cursor-pointer absolute top-2 right-2 accent-blue-500" 
                                            checked={selected.includes(img.id)} 
                                        /> 
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}

                {view === "faces" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {faceGroups.map((group, i) => (
                            <div key={i} className="rounded-xl overflow-hidden hover:scale-105 transition cursor-pointer shadow-sm">
                                <img src={group.thumbnail} className="w-full h-full object-cover aspect-square" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
