import { FiSearch, FiShield, FiStar, FiGrid, FiSettings, FiBookOpen } from "react-icons/fi";

const features = [
    {
        title: "Ready-to-use projects",
        description: "Browse curated projects you can learn from, customize, and ship.",
        icon: FiGrid,
    },
    {
        title: "Secure payments",
        description: "Secure, seamless checkout powered by Razorpay for safe purchases.",
        icon: FiShield,
    },
    {
        title: "Reviews & ratings",
        description: "Real feedback helps buyers choose confidently and creators improve.",
        icon: FiStar,
    },
    {
        title: "Categories & search",
        description: "Find the right project faster with categories, filters, and search.",
        icon: FiSearch,
    },
    {
        title: "Admin moderation",
        description: "Tools to manage listings and reviews, keeping the marketplace trusted.",
        icon: FiSettings,
    },
    {
        title: "Support & documentation",
        description: "Clear guidance to help you get started and troubleshoot quickly.",
        icon: FiBookOpen,
    },
];

export default function AboutFeatures() {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="max-w-2xl">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">What we offer</h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">
                        Everything you need to discover projects, trust your purchase, and collaborate through feedback.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((f) => {
                        const Icon = f.icon;
                        return (
                            <div
                                key={f.title}
                                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                        <Icon className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-extrabold text-gray-900">{f.title}</h3>
                                        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{f.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
