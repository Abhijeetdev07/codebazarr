export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
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
    rating?: number;
    totalSales?: number;
    creator?: User;
    createdAt: string;
    updatedAt: string;
}
