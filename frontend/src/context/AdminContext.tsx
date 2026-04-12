import axios from "axios";
import React, { createContext, useContext, useEffect, useRef, useState} from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export interface PhotoItem {
    id: number;
    image: string;
}

export interface AdminProfile {
    username: string;
    fullname: string;
    email: string;
}

export interface FaceGroup {
    group_id: number;
    thumbnail: string;
    bbox: number[];
    total_photos: number;
}

export interface GroupPhotos {
    group_id: number;
    total_photos: number;
    images: PhotoItem[];
}

export type Action = "view" | "faces" | "upload" | "delete";
export type View = "all" | "group" | null;

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

interface AdminContextValue {
    adminProfile: AdminProfile | null;
    photos: PhotoItem[];
    faceGroups: FaceGroup[];
    view: View | null;
    activeAction: Action;
    deleteMode: boolean;
    setDeleteMode: (value: boolean) => void;
    selected: number[];
    setSelected: React.Dispatch<React.SetStateAction<number[]>>;
    error: string;
    isLoading: boolean;
    isUploading: boolean;
    isGroupLoading: boolean;
    selectedGroup: GroupPhotos | null;
    isAllSelected: boolean;
    showConfirm: boolean;
    setShowConfirm: React.Dispatch<React.SetStateAction<boolean>>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleGroupPhotos: (group_id: number) => void;
    handleBackToGroups: () => void;
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
    handleConfirmDelete: (value: boolean) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [faceGroups, setFaceGroups] = useState<FaceGroup[]>([]);
    const [view, setView] = useState<View>("all");
    const [activeAction, setActiveAction] = useState<Action>("view");
    const [deleteMode, setDeleteMode] = useState<boolean>(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isGroupLoading, setIsGroupLoading] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupPhotos | null>(null);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    useEffect(() => {
        fetchAdminProfile();
        fetchPhotos();
    }, []);

    const handleAuthError = (err: any) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/adminlogin");
        } else if (err.response?.status === 500) {
            setError("Server error, please try again");
        } else {
            setError("Something went wrong");
        }
    };

    const fetchPhotos = async () => {
        setError("");
        setDeleteMode(false);
        setIsGroupLoading(false);
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

    const fetchAdminProfile = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/admin/profile/`, {
                headers: getAuthHeaders()
            });
            setAdminProfile(res.data);
        } 
        catch (err: any) {
            handleAuthError(err);
        }
    };    

    const fetchFaceGroups = async () => {
        setError("");
        setIsLoading(false);
        setDeleteMode(false);
        setIsGroupLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/admin/facegroups/`, { headers: getAuthHeaders() });
            setFaceGroups(res.data.groups);
        } catch {
            setError("Failed to load face groups");
        }
        finally {
            setIsGroupLoading(false);
        }
    };

    const handleUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError("");
        const files = e.target.files;
        if (!files)     return;
        setView(null);
        setDeleteMode(false);
        setActiveAction("upload");
        setIsUploading(true);
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));
        try {
            await axios.post(`${BACKEND_URL}/admin/upload/`, formData, {
                headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
            });
            setIsUploading(false);
            await fetchPhotos();
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setView("all");
            setActiveAction("view");
            e.target.value = "";
        }
    };

    const handleDeletePhotos = async () => {
        setView("all");
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

    const handleConfirmDelete = (value: boolean) => {
        if(value) {
            handleDeletePhotos();   
        }
        else {
            setSelected([]);
        }
        setShowConfirm(false);
    }

    const handleGroupPhotos = async (group_id: number) => {
        setError("");
        setIsLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/admin/facegroups/${group_id}`, { headers: getAuthHeaders() });
            setSelectedGroup(res.data);
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToGroups = () => {
        setSelectedGroup(null);
        setError("");
    };

    const handleViewAll = () => {
        setDeleteMode(false);
        setError("");
        setActiveAction("view");
        if(view === "all" && photos.length > 0)      return; 
        setView("all"); 
        fetchPhotos();
        setActiveAction("view"); 
    };

    const handleFaceGroups = () => { 
        setDeleteMode(false);
        setError("");
        setSelectedGroup(null);
        if(activeAction === "faces")    return;
        setActiveAction("faces");
        setView("group");
        fetchFaceGroups();
    };

    const handleUpload = () => {
        fileInputRef.current?.click();
    };

    const handleDelete = () => { 
        setDeleteMode(true);
        setIsGroupLoading(false);
        if(activeAction === "delete")     return;
        setView("all");
        setSelected([]); 
        setError(""); 
        setActiveAction("delete"); 
    };

    const handleCancel = () => { 
        setView("all"); 
        setSelected([]); 
        setDeleteMode(false); 
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
            adminProfile, photos, faceGroups, view, activeAction,
            deleteMode, setDeleteMode, selected, setSelected, error, isLoading, 
            isUploading, isAllSelected, fileInputRef, selectedGroup, isGroupLoading,
            showConfirm, setShowConfirm, handleGroupPhotos, handleBackToGroups, 
            handleViewAll,handleFaceGroups, handleUpload, handleDelete, handleCancel, 
            handleUploadPhotos, handleDeletePhotos, handleConfirmDelete, 
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