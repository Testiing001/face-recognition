import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { /* Upload, Trash2, */ LogOut } from "lucide-react";
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

    const [username, setUsername] = useState("");
    const [images, setImages] = useState<ImageItem[]>([]);
    const [faceGroups, setFaceGroups] = useState<any[]>([]);
    const [view, setView] = useState<"all" | "faces">("all");
    const [deleteMode, setDeleteMode] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setUsername(decoded.sub);
            } 
            catch {
                setUsername("Admin");
            }
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, []);

    const handleViewAll = () => {
        setView("all");
        setError("");
        if (images.length === 0) {
            fetchImages();
        }
    };

    const fetchImages = async () => {
        setError("");

        let loaderTimeout = setTimeout(() => {
            setIsLoading(true);
        }, 1000);

        try {
            const res = await axios.get(`${BACKEND_URL}/admin/view/`, {
                headers: getAuthHeaders(),
            });
            setImages(res.data.faces);
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            clearTimeout(loaderTimeout);
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
        setError("");
        setIsLoading(true); 
        const files = e.target.files;
        if (!files) return;

        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));

        try {
            await axios.post(`${BACKEND_URL}/admin/upload/`, formData, {
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "multipart/form-data",
                },
            });

            fetchImages();
        } catch (err: any) {
            handleAuthError(err);
        }

        e.target.value = "";
    };

    const handleDelete = async () => {
        if (selected.length === 0) return;

        try {
            await axios.delete(`${BACKEND_URL}/admin/delete/`, {
                headers: getAuthHeaders(),
                data: selected,
            });

            setImages((prev) => prev.filter((img) => !selected.includes(img.id)));
            setSelected([]);
            setDeleteMode(false);
        } catch (err: any) {
            handleAuthError(err);
        }
    };

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const isAllSelected = images.length > 0 && selected.length === images.length;

    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelected(images.map((img) => img.id));
        } else {
            setSelected([]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/adminlogin");
    };

    return (
        <div className="flex h-screen bg-gray-800/80 text-white overflow-hidden">
            <div className="w-64 bg-gray-800 p-4 flex flex-col justify-betweenflex-shrink-0">
                <div>
                    <div className="mb-6 mx-3">
                        <p className="text-xl font-semibold">{username}</p>
                        <p className="text-sm text-gray-400">Admin</p>
                    </div>
                    <hr className="border-gray-600 mb-4" />
                    <div className="flex flex-col gap-2">
                        <button onClick={handleViewAll}
                            className="text-left px-3 py-2 cursor-pointer rounded-lg hover:bg-gray-700">
                            View All Photos
                        </button>
                        <button onClick={() => { setView("faces"); fetchFaceGroups(); setError(""); }}
                            className="text-left px-3 py-2 cursor-pointer rounded-lg hover:bg-gray-700">
                            Face Categories
                        </button>
                        <button onClick={() => fileInputRef.current?.click()}
                            className="text-left px-3 py-2 cursor-pointer rounded-lg hover:bg-gray-700">
                            Upload Photos
                        </button>
                        <button onClick={() => { setDeleteMode(!deleteMode); setSelected([]); setError(""); }}
                            className="text-left px-3 py-2 cursor-pointer rounded-lg hover:bg-gray-700 text-red-400">
                            Delete Photos
                        </button>
                        {deleteMode && selected.length > 0 && (
                            <button onClick={handleDelete}
                                className="flex px-3 py-2 cursor-pointer rounded-lg bg-red-600 hover:bg-red-500">
                                Confirm Delete ({selected.length})
                            </button>
                        )}
                        {deleteMode && (
                            <div className="flex items-center gap-2 mt-2 mx-3">
                                <span>Select All</span>
                                <input type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleSelectAllChange}
                                    className="cursor-pointer accent-red-500"
                                />
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" multiple accept="image/*"
                            className="hidden" onChange={handleUploadImages} 
                        />
                    </div>
                </div>
                <div className="mt-auto">
                    <hr className="border-gray-700 mb-4" />
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-left py-2 px-3 cursor-pointer rounded-lg hover:bg-red-500">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                {error && <p className="text-red-400 mb-4">{error}</p>}
                
                {view === "all" && !isLoading && (
                    images.length === 0 ? (
                        <div className="flex items-center justify-center h-[60vh]">
                            <p className="text-gray-400 text-lg font-semibold">
                                No photos in database
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img) => (
                                <div key={img.id} className="relative">
                                    <img src={img.image} className="aspect-square object-cover rounded-lg" />
                                    {deleteMode && (
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 cursor-pointer absolute top-2 right-2 accent-red-500"
                                            checked={selected.includes(img.id)}
                                            onChange={() => toggleSelect(img.id)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}

                {view === "faces" && (
                    <div className="grid grid-cols-4 gap-4">
                        {faceGroups.map((group, i) => (
                            <div key={i} className="bg-gray-800 rounded-xl p-2 hover:scale-105 transition cursor-pointer">
                                <img src={group.thumbnail}
                                    className="rounded-lg aspect-square object-cover" />
                                <p className="text-center mt-2 text-sm text-gray-300">
                                    Person {i + 1}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
                {isLoading && (
                    <div className="flex items-center justify-center h-[60vh]">
                        <p className="text-gray-400 text-lg">Loading photos...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
