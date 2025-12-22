export default function AboutMissionVision() {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-6">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Our Mission</h2>
                        <ul className="mt-4 space-y-3 text-sm sm:text-base text-gray-700">
                            <li className="flex items-start gap-3">
                                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                                <span>
                                    Make high-quality projects easy to discover, so buyers can learn faster and ship with
                                    confidence.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                                <span>
                                    Empower creators to showcase their work, build reputation through reviews, and grow a
                                    sustainable income.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                                <span>
                                    Build a trusted community with transparent ratings, clear project details, and a
                                    smooth buying experience.
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="lg:col-span-6">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:p-8">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Our Vision</h2>
                            <p className="mt-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                                We envision CodeBazar as the go-to marketplace where developers and teams discover
                                reliable, production-ready projects, creators get recognized for their craftsmanship,
                                and everyone benefits from sharing knowledge through real feedback and continuous
                                improvement.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
