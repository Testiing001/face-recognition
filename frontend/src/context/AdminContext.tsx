import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export interface PhotoItem {
    id: number;
    image: string;
}

export type Action = "view" | "faces" | "upload" | "delete";
export type View = "all" | "faces";

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

interface AdminContextValue {
    username: string;
    photos: PhotoItem[];
    faceGroups: any[];
    view: View;
    activeAction: Action;
    deleteMode: boolean;
    selected: number[];
    error: string;
    isLoading: boolean;
    isUploading: boolean;
    isAllSelected: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleViewAll: () => void;
    handleFaceGroups: () => void;
    handleUpload: () => void;
    handleDelete: () => void;
    handleCancel: () => void;
    handleUploadPhotos: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleDeletePhotos: () => Promise<void>;
    handleLogout: () => void;
    toggleSelect: (id: number) => void;
    handleSelectAllChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [username, setUsername] = useState("");
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [faceGroups, setFaceGroups] = useState<any[]>([]);
    const [view, setView] = useState<View>("all");
    const [activeAction, setActiveAction] = useState<Action>("view");
    const [deleteMode, setDeleteMode] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

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
        fetchPhotos();
    }, []);

    const handleAuthError = (err: any) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/adminlogin");
        } else {
            setError("Something went wrong");
        }
    };

    const fetchPhotos = async () => {
        setError("");
        setIsLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/admin/view/`, { headers: getAuthHeaders() });
            setPhotos(res.data.faces);
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFaceGroups = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/admin/face-groups/`, { headers: getAuthHeaders() });
            setFaceGroups(res.data.groups);
        } catch {
            setError("Failed to load face groups");
        }
    };

    const handleUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setError("");
        setIsUploading(true);
        setActiveAction("upload");
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));
        try {
            await axios.post(`${BACKEND_URL}/admin/upload/`, formData, {
                headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
            });
            await fetchPhotos();
            setView("all");
            setActiveAction("view");
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handleDeletePhotos = async () => {
        if (selected.length === 0) return;
        try {
            await axios.delete(`${BACKEND_URL}/admin/delete/`, {
                headers: getAuthHeaders(),
                data: selected,
            });
            setPhotos((prev) => prev.filter((img) => !selected.includes(img.id)));
            setSelected([]);
            setDeleteMode(false);
            setActiveAction("view");
        } catch (err: any) {
            handleAuthError(err);
        }
    };

    const handleViewAll = () => { 
        setDeleteMode(false); 
        setError(""); 
        fetchPhotos(); 
        setView("all"); setActiveAction("view"); 
    };

    const handleFaceGroups = () => { 
        setDeleteMode(false); 
        setError(""); 
        fetchFaceGroups(); 
        setView("faces"); 
        setActiveAction("faces"); 
    };

    const handleUpload = () => { 
        fileInputRef.current?.click(); 
        setDeleteMode(false); 
    };

    const handleDelete = () => { 
        setSelected([]); 
        setDeleteMode(true); 
        setError(""); 
        setView("all"); 
        setActiveAction("delete"); 
    };

    const handleCancel = () => { 
        setSelected([]); 
        setDeleteMode(false); 
        setView("all"); 
        setActiveAction("view"); 
    };

    const handleLogout = () => { 
        localStorage.removeItem("token"); 
        navigate("/adminlogin"); 
    };

    const toggleSelect = (id: number) => {
        setSelected((prev) => prev.includes(id) 
            ? prev.filter((i) => i !== id) 
            : [...prev, id]);
    }

    const isAllSelected = photos.length > 0 && selected.length === photos.length;

    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelected(e.target.checked 
            ? photos.map((p) => p.id) 
            : []);
    }

    return (
        <AdminContext.Provider value={{
            username, photos, faceGroups, view, activeAction,
            deleteMode, selected, error, isLoading, isUploading,
            isAllSelected, fileInputRef,
            handleViewAll, handleFaceGroups, handleUpload, handleDelete,
            handleCancel, handleUploadPhotos, handleDeletePhotos,
            handleLogout, toggleSelect, handleSelectAllChange,
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) throw new Error("useAdmin must be used inside AdminProvider");
    return context;
};