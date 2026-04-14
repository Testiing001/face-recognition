import axios from "axios";
import React, { createContext, useContext, useEffect, useRef, useState} from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export interface AdminProfile {
    username: string;
    fullname: string;
    email: string;
}

export interface PhotoItem {
    id: number;
    image: string;
}

export interface PageInfo {
    page: number;
    totalPages: number;
}

export interface FaceGroup {
    group_id: number;
    thumbnail: string;
    bbox: number[];
    count: number;
}

export interface GroupPhotos {
    group_id: number;
    count: number;
    photos: PhotoItem[];
}

export type Tab = "all" | "groups" | "upload";

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

interface AdminContextValue {
    adminProfile: AdminProfile | null;
    activeTab: Tab;
    error: string;
    photos: PhotoItem[];
    faceGroups: FaceGroup[];
    deleteMode: boolean;
    selected: number[];
    selectedGroup: GroupPhotos | null;
    hoveredPhoto: number | null;
    isLoading: boolean;
    isAllSelected: boolean;
    showConfirm: boolean;
    pageInfo: PageInfo;
    sidebarOpen: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    fetchPhotos: (page?: number) => Promise<void>; 
    handleViewAll: () => void;
    handleFaceGroups: () => void;
    handleGroupPhotos: (group_id: number) => void;
    handleBackToGroups: () => void;
    handleUpload: () => void;
    handleUploadPhotos: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    setDeleteMode: (value: boolean) => void;
    handleDeletePhotos: () => Promise<void>;
    handleCancel: () => void;
    setHoveredPhoto: React.Dispatch<React.SetStateAction<number | null>>;
    setSelected: React.Dispatch<React.SetStateAction<number[]>>;
    handleSelectAllChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    toggleSelect: (id: number) => void;
    setShowConfirm: React.Dispatch<React.SetStateAction<boolean>>;
    handleConfirmDelete: (value: boolean) => void;
    setSidebarOpen: (value: boolean) => void;
    handleLogout: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("all");
    const [error, setError] = useState("");
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [faceGroups, setFaceGroups] = useState<FaceGroup[]>([]);
    const [deleteMode, setDeleteMode] = useState<boolean>(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<GroupPhotos | null>(null);
    const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [pageInfo, setPageInfo] = useState<PageInfo>({page: 1, totalPages: 1,});
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    useEffect(() => {
        fetchAdminProfile();
        fetchPhotos(1);
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

    const fetchPhotos = async (currentPage = pageInfo.page) => {
        setError("");
        setDeleteMode(false);
        setIsLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/admin/view/?page=${currentPage}&limit=20`, { headers: getAuthHeaders() });
            setPhotos(res.data.faces);
            setPageInfo({page: res.data.page, totalPages: res.data.total_pages});
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
        setIsLoading(true);
        setDeleteMode(false);
        try {
            const res = await axios.get(`${BACKEND_URL}/admin/facegroups/`, { headers: getAuthHeaders() });
            setFaceGroups(res.data.groups);
        } catch {
            setError("Failed to load face groups");
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError("");
        const files = e.target.files;
        if (!files)     return;
        setDeleteMode(false);
        setActiveTab("upload");
        setIsLoading(true);
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));
        try {
            await axios.post(`${BACKEND_URL}/admin/upload/`, formData, {
                headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
            });
            setIsLoading(false);
            toast.success(files.length > 1 ? "Photos Uploaded" : "Photo Uploaded");
            await fetchPhotos(1);
        } catch (err: any) {
            handleAuthError(err);
            setIsLoading(false);
        } finally {
            setActiveTab("all");
            e.target.value = "";
        }
    };

    const handleDeletePhotos = async () => {
        setError("");
        const count = selected.length;
        if (count === 0) return;
        try {
            await axios.delete(`${BACKEND_URL}/admin/delete/`, {
                headers: getAuthHeaders(),
                data: selected,
            });
            toast.error(count > 1 ? "Photos deleted" : "Photo deleted");
            await fetchFaceGroups();
            
            setSelectedGroup((prev) => prev ? {
                    ...prev,
                    photos: prev.photos.filter(
                        (img) => !selected.includes(img.id)
                    ),
                    count: prev.count - count,
                } : null
            );
            if (activeTab === "all") {
                if (photos.length === count && pageInfo.page > 1) {
                    await fetchPhotos(pageInfo.page - 1);
                } else {
                    await fetchPhotos(pageInfo.page);
                }
            } else {
                setPhotos((prev) =>
                    prev.filter((img) => !selected.includes(img.id))
                );
            }
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setDeleteMode(false);
            setSelected([]);
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
        setSelected([]);
        if(activeTab === "all" && photos.length > 0)      return; 
        setActiveTab("all");
        fetchPhotos(1);
    };

    const handleFaceGroups = () => { 
        setDeleteMode(false);
        setError("");
        setSelectedGroup(null);
        setSelected([]);
        if(activeTab === "groups")    return;
        setActiveTab("groups");
        fetchFaceGroups();
    };

    const handleUpload = () => {
        fileInputRef.current?.click();
    };

    const handleCancel = () => { 
        setSelected([]); 
        setDeleteMode(false); 
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
    
    const currentPhotos = activeTab === "groups" ? selectedGroup?.photos ?? [] : photos;

    const isAllSelected =  currentPhotos.length > 0 && selected.length === currentPhotos.length;

    const handleSelectAllChange = (e: any) => {
        const currentPhotos = activeTab === "groups"
            ? selectedGroup?.photos ?? []
            : photos;

        setSelected(e.target.checked ? currentPhotos.map((p) => p.id) : []);
    };

    return (
        <AdminContext.Provider value={{
            adminProfile, activeTab, error, photos, faceGroups,
            deleteMode, selectedGroup, selected, hoveredPhoto, isLoading,
            isAllSelected, fileInputRef, showConfirm, pageInfo, sidebarOpen, 
            fetchPhotos, handleViewAll, handleFaceGroups, handleGroupPhotos, 
            handleBackToGroups, handleUpload, handleCancel, handleUploadPhotos, 
            setDeleteMode , handleDeletePhotos, setSelected, setHoveredPhoto, 
            toggleSelect, handleSelectAllChange, setShowConfirm, 
            handleConfirmDelete, setSidebarOpen, handleLogout
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