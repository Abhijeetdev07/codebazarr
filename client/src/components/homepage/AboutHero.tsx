import Link from "next/link";

export default function AboutHero() {
    return (
        <section className="relative overflow-hidden bg-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-7">
                        <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                            About CodeBazar
                        </div>

                        <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
                            About CodeBazar
                        </h1>

                        <p className="mt-3 text-base sm:text-lg font-semibold text-indigo-600">
                            Buy and sell projects, faster.
                        </p>

                        <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                            CodeBazar is a marketplace where creators share ready-to-use projects and buyers discover
                            high-quality code they can learn from, customize, and ship.
                            <br />
                            Whether you are building your first app or scaling a product, our goal is to help you move
                            from idea to launch with confidence.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Link
                                href="/projects"
                                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
                            >
                                Explore Projects
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-6 shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl bg-white border border-gray-100 p-4">
                                    <div className="text-xs font-semibold text-gray-500">For Buyers</div>
                                    <div className="mt-2 text-sm font-bold text-gray-900">Discover</div>
                                    <div className="mt-1 text-xs text-gray-600">Browse projects by category and rating.</div>
                                </div>
                                <div className="rounded-xl bg-white border border-gray-100 p-4">
                                    <div className="text-xs font-semibold text-gray-500">For Developers</div>
                                    <div className="mt-2 text-sm font-bold text-gray-900">Build</div>
                                    <div className="mt-1 text-xs text-gray-600">Start with a solid base and customize.</div>
                                </div>
                                <div className="rounded-xl bg-white border border-gray-100 p-4">
                                    <div className="text-xs font-semibold text-gray-500">Trust</div>
                                    <div className="mt-2 text-sm font-bold text-gray-900">Reviews</div>
                                    <div className="mt-1 text-xs text-gray-600">Ratings help you choose with clarity.</div>
                                </div>
                                <div className="rounded-xl bg-white border border-gray-100 p-4">
                                    <div className="text-xs font-semibold text-gray-500">Speed</div>
                                    <div className="mt-2 text-sm font-bold text-gray-900">Ship</div>
                                    <div className="mt-1 text-xs text-gray-600">Start faster and iterate confidently.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
