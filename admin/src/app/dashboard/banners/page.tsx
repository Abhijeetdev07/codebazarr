"use client";

import { useState, useEffect } from "react";
import { bannerAPI } from "@/lib/api";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiImage, FiEye, FiEyeOff, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";

interface Banner {
    _id: string;
    title: string;
    image: string;
    isActive: boolean;
}

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [existingImage, setExistingImage] = useState<string>("");

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await bannerAPI.getAll();
            if (res.data.success) {
                // Handle potential missing/null order for sorting
                setBanners(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load banners");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await bannerAPI.update(id, { isActive: !currentStatus });
            setBanners(banners.map(b =>
                b._id === id ? { ...b, isActive: !currentStatus } : b
            ));
            toast.success(`Banner ${!currentStatus ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("title", title);

            if (selectedImage) {
                formData.append("banner", selectedImage);
            } else if (editingBanner && existingImage) {
                formData.append("existingImage", existingImage);
            }

            if (editingBanner) {
                const res = await bannerAPI.update(editingBanner._id, formData);
                if (res.data.success) {
                    toast.success("Banner updated");
                    setBanners(banners.map(b => b._id === editingBanner._id ? res.data.data : b));
                }
            } else {
                const res = await bannerAPI.create(formData);
                if (res.data.success) {
                    toast.success("Banner created");
                    setBanners([...banners, res.data.data]);
                }
            }
            closeModal();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Operation failed";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this banner?")) return;
        try {
            await bannerAPI.delete(id);
            setBanners(banners.filter(b => b._id !== id));
            toast.success("Banner deleted");
        } catch (error) {
            toast.error("Failed to delete banner");
        }
    };

    const openModal = (banner?: Banner) => {
        if (banner) {
            setEditingBanner(banner);
            setTitle(banner.title);
            setExistingImage(banner.image);
            setImagePreview(banner.image);
        } else {
            setEditingBanner(null);
            setTitle("");
            setExistingImage("");
            setImagePreview("");
        }
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBanner(null);
        setTitle("");
        setSelectedImage(null);
        setImagePreview("");
        setExistingImage("");
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-28"></div>
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>

                {/* Table Skeleton */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <th key={i} className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                                        <td className="px-6 py-4"><div className="h-16 w-28 bg-gray-200 rounded-lg"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <FiPlus /> Add Banner
                </button>
            </div>

            {/* Table View */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {banners.map((banner) => (
                                <tr key={banner._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="h-16 w-28 rounded-lg bg-gray-100 overflow-hidden">
                                            {banner.image ? (
                                                <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                    <FiImage size={24} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{banner.title}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(banner._id, banner.isActive)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${banner.isActive ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                            role="switch"
                                            aria-checked={banner.isActive}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${banner.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openModal(banner)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {banners.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No banners found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingBanner ? "Edit Banner" : "New Banner"}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Banner title (Internal use only)"
                                />
                            </div>



                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="banner-image-upload"
                                    />
                                    <label htmlFor="banner-image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                        <FiUpload className="h-8 w-8 text-gray-400" />
                                        <span className="text-sm text-gray-500">Click to upload banner image</span>
                                    </label>
                                </div>

                                {imagePreview && (
                                    <div className="mt-4 relative">
                                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                        {selectedImage && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedImage(null);
                                                    setImagePreview(existingImage);
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className={`px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {saving ? (
                                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                                    ) : (
                                        <FiSave />
                                    )}
                                    {saving
                                        ? (editingBanner ? "Updating..." : "Creating...")
                                        : (editingBanner ? "Update" : "Create")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
