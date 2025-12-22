"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiGithub, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiMapPin, FiPhone, FiChevronRight } from "react-icons/fi";
import logo from "../assets/logo.png";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [quickLinksOpen, setQuickLinksOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-5">
                    {/* Brand & About */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-block relative">
                            <Image
                                src={logo}
                                alt="CodeBazar Logo"
                                width={150}
                                height={40}
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            The premium marketplace for high-quality coding projects, templates, and scripts. Buy, sell, and learn from the best developers in the community.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                <FiGithub className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                <FiTwitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                <FiInstagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                <FiLinkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <button
                            onClick={() => setQuickLinksOpen(!quickLinksOpen)}
                            className="md:hidden flex items-center justify-between w-full text-white font-semibold text-lg py-2 border-b border-gray-800"
                        >
                            Quick Links
                            <FiChevronRight className={`h-5 w-5 transition-transform duration-200 ${quickLinksOpen ? 'rotate-90' : ''}`} />
                        </button>
                        <h3 className="hidden md:block text-white font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className={`space-y-2 mt-4 md:mt-0 md:mb-0 ${quickLinksOpen ? 'block' : 'hidden md:block'}`}>
                            <li>
                                <Link href="/projects" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 text-sm">
                                    Explore Projects
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 text-sm">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 text-sm">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <button
                            onClick={() => setCategoriesOpen(!categoriesOpen)}
                            className="md:hidden flex items-center justify-between w-full text-white font-semibold text-lg py-2 border-b border-gray-800"
                        >
                            Top Categories
                            <FiChevronRight className={`h-5 w-5 transition-transform duration-200 ${categoriesOpen ? 'rotate-90' : ''}`} />
                        </button>
                        <h3 className="hidden md:block text-white font-semibold text-lg mb-4">Top Categories</h3>
                        <ul className={`space-y-2 mt-4 md:mt-0 md:mb-0 ${categoriesOpen ? 'block' : 'hidden md:block'}`}>
                            <li>
                                <Link href="/projects?category=full-stack" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 text-sm">
                                    Full Stack
                                </Link>
                            </li>
                            <li>
                                <Link href="/projects?category=app-developement" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 text-sm">
                                    App Developement
                                </Link>
                            </li>
                            <li>
                                <Link href="/projects?category=html-css-js" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 text-sm">
                                    Html Css Js
                                </Link>
                            </li>
                            <li>
                                <Link href="/projects?category=react-js" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 text-sm">
                                    React js
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <button
                            onClick={() => setContactOpen(!contactOpen)}
                            className="md:hidden flex items-center justify-between w-full text-white font-semibold text-lg py-2 border-b border-gray-800"
                        >
                            Contact Us
                            <FiChevronRight className={`h-5 w-5 transition-transform duration-200 ${contactOpen ? 'rotate-90' : ''}`} />
                        </button>
                        <h3 className="hidden md:block text-white font-semibold text-lg mb-4">Contact Us</h3>
                        <ul className={`space-y-2 mt-4 md:mt-0 md:mb-0 ${contactOpen ? 'block' : 'hidden md:block'}`}>
                            <li className="flex items-start gap-3">
                                <FiMapPin className="h-5 w-5 text-indigo-400 mt-0.5" />
                                <span className="text-gray-400 text-sm">123 Tech Street, Silicon Valley, CA 94025, USA</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FiMail className="h-5 w-5 text-indigo-400" />
                                <a href="mailto:support@codebazar.com" className="text-gray-400 hover:text-white transition-colors text-sm">support@codebazar.com</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <FiPhone className="h-5 w-5 text-indigo-400" />
                                <span className="text-gray-400 text-sm">+1 (555) 123-4567</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 text-center md:text-left">
                        &copy; {currentYear} CodeBazarr. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                        Made with <span className="text-red-500">♥</span> by CodeBazar Team
                    </p>
                </div>
            </div>
        </footer>
    );
}
