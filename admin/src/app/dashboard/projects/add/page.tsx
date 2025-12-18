"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { projectAPI, categoryAPI } from "@/lib/api";
import { FiUpload, FiX, FiPlus, FiMinus, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AddProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Temp inputs
    const [techInput, setTechInput] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryAPI.getAll();
                if (res.data.success) {
                    setCategories(res.data.data);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    // Handlers
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedImages(prev => [...prev, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("demoUrl", demoUrl);
            formData.append("sourceCodeUrl", sourceCodeUrl);

            technologies.forEach(tech => formData.append("technologies[]", tech));
            // Filter out empty features
            features.filter(f => f.trim()).forEach(feature => formData.append("features[]", feature));

            selectedImages.forEach(image => formData.append("images", image));

            const res = await projectAPI.create(formData);
            if (res.data.success) {
                toast.success("Project created successfully!");
                router.push("/dashboard/projects");
            }
        } catch (error: any) {
            console.error("Create project error:", error);
            const msg = error.response?.data?.message || "Failed to create project";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Project</h1>

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
                                placeholder="e.g. E-Commerce Platform"
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
                                placeholder="499"
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
                                placeholder="Detailed description of the project..."
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
                            id="images-upload"
                        />
                        <label htmlFor="images-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                            <FiUpload className="h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-500">Click to upload images</span>
                        </label>
                    </div>

                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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
                                placeholder="https://demo.example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Source Code URL (Download Link)</label>
                            <input
                                type="url"
                                required
                                value={sourceCodeUrl}
                                onChange={e => setSourceCodeUrl(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="https://drive.google.com/..."
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
                                placeholder="Type and press Enter (e.g. React, Node.js)"
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
                                        placeholder={`Feature ${index + 1}`}
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
                        disabled={loading}
                        className={`
                            px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 flex items-center gap-2
                            ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                    >
                        {loading ? <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span> : <FiSave />}
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>

            </form>
        </div>
    );
}

// Icon component needed for features deletion
function FiTrash2({ className }: { className?: string }) {
    return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
    )
}
