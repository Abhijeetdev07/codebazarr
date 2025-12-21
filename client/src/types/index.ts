export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export interface Review {
    _id: string;
    projectId: string;
    userId: { _id: string; name: string } | string;
    rating: number;
    comment?: string;
    createdAt: string;
}

export interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
}

export interface Project {
    _id: string;
    title: string;
    description: string;
    category: Category;
    price: number;
    discountedPrice?: number;
    images: string[];
    technologies: string[];
    features?: string[];
    demoUrl?: string;
    sourceCodeUrl?: string;
    avgRating?: number;
    reviewCount?: number;
    rating?: number;
    totalSales?: number;
    creator?: User;
    createdAt: string;
    updatedAt: string;
}
