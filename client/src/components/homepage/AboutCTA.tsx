import Link from "next/link";

export default function AboutCTA() {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 sm:p-10 text-white">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-8">
                            <h2 className="text-xl sm:text-2xl font-extrabold">
                                Ready to build faster with trusted, ready-to-use projects?
                            </h2>
                            <p className="mt-2 text-sm sm:text-base text-indigo-100">
                                Explore CodeBazar to find high-quality projects and join a community powered by real
                                reviews.
                            </p>
                        </div>

                        <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
                            <Link
                                href="/projects"
                                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-colors"
                            >
                                Explore Projects
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center rounded-xl border border-indigo-200/60 bg-transparent px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
