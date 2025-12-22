import Link from "next/link";
import { FiArrowRightCircle, FiShoppingBag, FiStar, FiTool } from "react-icons/fi";

const steps = [
    {
        title: "Browse projects",
        description: "Explore projects by category, tech stack, and popularity.",
        icon: FiShoppingBag,
    },
    {
        title: "View details & reviews",
        description: "Check screenshots, features, and verified reviews before choosing.",
        icon: FiStar,
    },
    {
        title: "Purchase / access",
        description: "Get access quickly so you can start building without delays.",
        icon: FiArrowRightCircle,
    },
    {
        title: "Customize & leave a review",
        description: "Make it yours, then share feedback to help the community grow.",
        icon: FiTool,
    },
];

export default function AboutHowItWorks() {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="max-w-2xl">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">How it works</h2>
                        <p className="mt-2 text-sm sm:text-base text-gray-600">
                            A simple flow designed for both buyers and creators.
                        </p>
                    </div>
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                    >
                        Explore Projects
                        <span aria-hidden>
                            <FiArrowRightCircle className="h-4 w-4" />
                        </span>
                    </Link>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {steps.map((s, idx) => {
                        const Icon = s.icon;
                        return (
                            <div
                                key={s.title}
                                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                        <Icon className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div className="text-xs font-extrabold text-gray-400">0{idx + 1}</div>
                                </div>
                                <h3 className="mt-4 text-sm font-extrabold text-gray-900">{s.title}</h3>
                                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{s.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
