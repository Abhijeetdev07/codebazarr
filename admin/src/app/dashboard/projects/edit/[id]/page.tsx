"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { projectAPI, categoryAPI } from "@/lib/api";
import { FiUpload, FiX, FiPlus, FiTrash2, FiSave, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import Image from "next/image";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditProjectPage({ params }: PageProps) {
    // Unrap params using React.use()
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [demoUrl, setDemoUrl] = useState("");
    const [sourceCodeUrl, setSourceCodeUrl] = useState("");
    const [technologies, setTechnologies] = useState<string[]>([]);
    const [features, setFeatures] = useState<string[]>([""]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Temp inputs
    const [techInput, setTechInput] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectRes, categoryRes] = await Promise.all([
                    projectAPI.getById(id),
                    categoryAPI.getAll()
                ]);

                if (categoryRes.data.success) {
                    setCategories(categoryRes.data.data);
                }

                if (projectRes.data.success) {
                    const project = projectRes.data.data;
                    setTitle(project.title);
                    setDescription(project.description);
                    setPrice(project.price.toString());
                    setCategory(project.category._id || project.category);
                    setDemoUrl(project.demoUrl || "");
                    setSourceCodeUrl(project.sourceCodeUrl || "");
                    setTechnologies(project.technologies || []);
                    setFeatures(project.features && project.features.length > 0 ? project.features : [""]);
                    setExistingImages(project.images || []);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load project data");
                router.push("/dashboard/projects");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    // Handlers
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedImages(prev => [...prev, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeNewImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const addTechnology = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && techInput.trim()) {
            e.preventDefault();
            if (!technologies.includes(techInput.trim())) {
                setTechnologies([...technologies, techInput.trim()]);
            }
            setTechInput("");
        }
    };

    const removeTechnology = (tech: string) => {
        setTechnologies(technologies.filter(t => t !== tech));
    };

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    const addFeature = () => {
        setFeatures([...features, ""]);
    };

    const removeFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("demoUrl", demoUrl);
            formData.append("sourceCodeUrl", sourceCodeUrl);

            technologies.forEach(tech => formData.append("technologies[]", tech));
            features.filter(f => f.trim()).forEach(feature => formData.append("features[]", feature));

            // Handle existing images - send as string URLs
            existingImages.forEach(img => formData.append("existingImages[]", img));

            // Handle new images
            selectedImages.forEach(image => formData.append("images", image));

            const res = await projectAPI.update(id, formData);
            if (res.data.success) {
                toast.success("Project updated successfully!");
                router.push("/dashboard/projects");
            }
        } catch (error: any) {
            console.error("Update project error:", error);
            const msg = error.response?.data?.message || "Failed to update project";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading project details...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FiArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                required
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                required
                                rows={4}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Project Images</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="images-upload-edit"
                        />
                        <label htmlFor="images-upload-edit" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                            <FiUpload className="h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-500">Click to upload new images</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {/* Existing Images */}
                        {existingImages.map((src, index) => (
                            <div key={`existing-${index}`} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <img src={src} alt="Existing" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white text-xs font-medium">Existing</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(index)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        ))}

                        {/* New Images */}
                        {imagePreviews.map((src, index) => (
                            <div key={`new-${index}`} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100 border border-green-200">
                                <img src={src} alt="New Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-green-400 text-xs font-medium">New</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(index)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technical Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Technical Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Demo URL</label>
                            <input
                                type="url"
                                value={demoUrl}
                                onChange={e => setDemoUrl(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Source Code URL</label>
                            <input
                                type="url"
                                required
                                value={sourceCodeUrl}
                                onChange={e => setSourceCodeUrl(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
                            <input
                                type="text"
                                value={techInput}
                                onChange={e => setTechInput(e.target.value)}
                                onKeyDown={addTechnology}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Type and press Enter to add..."
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {technologies.map(tech => (
                                    <span key={tech} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                                        {tech}
                                        <button type="button" onClick={() => removeTechnology(tech)} className="hover:text-red-500">
                                            <FiX />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Features List</label>
                            {features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={e => updateFeature(index, e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    {features.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <FiTrash2 className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addFeature}
                                className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                            >
                                <FiPlus /> Add Another Feature
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className={`
                            px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 flex items-center gap-2
                            ${saving ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                    >
                        {saving ? <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span> : <FiSave />}
                        {saving ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </div>

            </form>
        </div>
    );
}
