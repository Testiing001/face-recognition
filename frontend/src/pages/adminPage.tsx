import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Upload, Trash2, Tag, LogOut } from "lucide-react";

interface ImageItem {
    id: number;
    image: string;
}

/* type Status = "images" | "preview";
 */
export const AdminPage = () => {
    /* const [status, setStatus] = useState<Status>("images"); */
    const [images, setImages] = useState<ImageItem[]>([]);
    const [deleteMode, setDeleteMode] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
/*     const [error, setError] = useState("");
 */
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await axios.get("http://localhost:8000/admin/images");
                setImages(res.data);
            } catch (err: any) {
/*                 setError(err);
 */            }
        };
        fetchImages();
    }, []);

    const handleUploadImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages: string[] = [];
        const reader = new FileReader();

        Array.from(files).forEach((file) => {
            reader.onload = () => {
                newImages.push(reader.result as string);
                if (newImages.length === files.length) {
                    setImages((prev) => [
                        ...prev,
                        ...newImages.map((img) => ({ id: prev.length + 1, image: img })),
                    ]);
/*                     setStatus("preview");
 */                }
            };
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
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
                        onClick={() => setDeleteMode(!deleteMode)}
                        className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg transition bg-red-700 hover:bg-red-600"
                    >
                        <Trash2 size={16} />{deleteMode ? "Cancel Delete" : "Delete Photos"}
                    </button>
                </div>

                <button className="flex items-center gap-2 cursor-pointer">
                    <LogOut size={16} />Logout
                </button>
            </div>

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
                                className="w-full h-48 object-cover"
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