"use client";

import Link from "next/link";

export default function CtaSection() {
    return (
        <section className="py-20 bg-gradient-to-r from-indigo-900 to-purple-900 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                    Ready to Start Your Next Big Idea?
                </h2>
                <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
                    Join thousands of developers who are building faster with our premium code templates.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-900 font-bold rounded-full hover:bg-indigo-50 transition-all transform hover:-translate-y-1 shadow-lg">
                        Get Started for Free
                    </Link>
                    <Link href="/projects" className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all">
                        Browse Collection
                    </Link>
                </div>
            </div>
        </section>
    );
}

