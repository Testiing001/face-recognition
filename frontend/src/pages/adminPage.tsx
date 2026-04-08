import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Upload, Trash2, Tag, LogOut } from "lucide-react";

const BASE_URL = "https://studious-enigma-77wp5pqj6v63xxqj-8000.app.github.dev";

interface ImageItem {
    id: number;
    image: string;
}

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const AdminPage = () => {
    const navigate = useNavigate();
    const [images, setImages] = useState<ImageItem[]>([]);
    const [deleteMode, setDeleteMode] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch images on load
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/admin/view/`, {
                    headers: getAuthHeaders(),
                });
                setImages(res.data.faces);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/adminlogin");
                } else {
                    setError("Failed to load images");
                }
            }
        };
        fetchImages();
    }, []);

    // Upload images to backend
    const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));

        try {
            await axios.post(`${BASE_URL}/admin/upload/`, formData, {
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "multipart/form-data",
                },
            });

            // Refresh images after upload
            const res = await axios.get(`${BASE_URL}/admin/view/`, {
                headers: getAuthHeaders(),
            });
            setImages(res.data.faces);
        } catch (err: any) {
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/adminlogin");
            } else {
                setError("Failed to upload images");
            }
        }

        e.target.value = "";
    };

    // Delete selected images
    const handleDelete = async () => {
        if (selected.length === 0) return;

        try {
            await axios.delete(`${BASE_URL}/admin/delete/`, {
                headers: getAuthHeaders(),
                data: selected,
            });
            setImages((prev) => prev.filter((img) => !selected.includes(img.id)));
            setSelected([]);
            setDeleteMode(false);
        } catch (err: any) {
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/adminlogin");
            } else {
                setError("Failed to delete images");
            }
        }
    };

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/adminlogin");
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-4 px-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-indigo-600 hover:bg-indigo-500 rounded-lg transition">
                        <Tag size={16} />Face Category
                    </button>

                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-500 rounded-lg transition">
                        <Upload size={16} />Upload Photos
                    </button>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                        onChange={handleUploadImages}
                    />

                    <button
                        onClick={() => { setDeleteMode(!deleteMode); setSelected([]); }}
                        className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg transition bg-red-700 hover:bg-red-600"
                    >
                        <Trash2 size={16} />{deleteMode ? "Cancel" : "Delete Photos"}
                    </button>

                    {deleteMode && selected.length > 0 && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg transition bg-red-500 hover:bg-red-400 font-semibold"
                        >
                            Confirm Delete ({selected.length})
                        </button>
                    )}
                </div>

                <button onClick={handleLogout} className="flex items-center gap-2 cursor-pointer hover:text-red-400 transition">
                    <LogOut size={16} />Logout
                </button>
            </div>

            {error && <p className="mb-4 text-red-400 font-semibold">{error}</p>}

            {deleteMode && (
                <p className="mb-4 text-red-400 font-semibold">
                    Select images to delete
                </p>
            )}

            {images.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className={`relative border rounded-lg overflow-hidden ${selected.includes(img.id) ? "border-red-500 ring-2 ring-red-500" : "border-gray-700"}`}
                        >
                            <img
                                src={img.image}
                                alt={`${img.id}`}
                                className="w-full h-48 object-contain"
                            />

                            {deleteMode && (
                                <input
                                    type="checkbox"
                                    className="absolute top-2 left-2 w-5 h-5 accent-red-500"
                                    checked={selected.includes(img.id)}
                                    onChange={() => toggleSelect(img.id)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-[80vh] flex items-center justify-center">
                    <div className="flex items-center justify-center w-full h-full border border-gray-700 rounded-lg bg-gray-800 text-gray-400 text-xl font-semibold text-center p-4">
                        No photos in the database
                    </div>
                </div>
            )}
        </div>
    );
};