import { FiCheckCircle, FiUsers, FiZap, FiShield } from "react-icons/fi";

const highlights = [
    {
        title: "Quality first",
        description: "Clear project details and a focus on practical, production-ready code.",
        icon: FiCheckCircle,
    },
    {
        title: "Trusted community",
        description: "Transparent reviews and ratings help you choose with confidence.",
        icon: FiUsers,
    },
    {
        title: "Fast support",
        description: "Get help quickly so you can keep moving from idea to launch.",
        icon: FiZap,
    },
    {
        title: "Safe experience",
        description: "A marketplace designed with reliability and trust in mind.",
        icon: FiShield,
    },
];

export default function AboutWhyChooseUs() {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="max-w-2xl">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Why choose us</h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">
                        We focus on trust, clarity, and speed so you can build with confidence.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {highlights.map((h) => {
                        const Icon = h.icon;
                        return (
                            <div
                                key={h.title}
                                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                    <Icon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h3 className="mt-4 text-sm font-extrabold text-gray-900">{h.title}</h3>
                                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{h.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
