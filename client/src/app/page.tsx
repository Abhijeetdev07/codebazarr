"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import CategorySection from "@/components/CategorySection";
import ProjectCard from "@/components/ProjectCard";
import { projectAPI } from "@/lib/api";
import { Project } from "@/types";
import { FiArrowRight } from "react-icons/fi";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectAPI.getAll({ limit: 8 }); // Fetch top 8 projects
        if (response.data.success) {
          setProjects(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Hero Section */}
      <HeroSlider />

      {/* Categories Section */}
      <CategorySection />

      {/* Featured Projects Section */}
      <section className="py-10 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Projects
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                Explore our hand-picked selection of premium coding projects, ready to use and easy to customize.
              </p>
            </div>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 font-semibold rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300 whitespace-nowrap"
            >
              View All Projects
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="w-full min-w-[300px] max-w-[320px] h-full">
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full animate-pulse">
                    <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                      <div className="absolute top-3 left-3 h-6 w-24 bg-gray-200 rounded-full" />
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <div className="mb-2">
                        <div className="h-5 w-3/4 bg-gray-200 rounded" />
                        <div className="mt-2 space-y-2">
                          <div className="h-4 w-full bg-gray-100 rounded" />
                          <div className="h-4 w-5/6 bg-gray-100 rounded" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                        <div className="h-3 w-20 bg-gray-100 rounded" />
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="h-6 w-16 bg-gray-100 rounded-md" />
                        <div className="h-6 w-20 bg-gray-100 rounded-md" />
                        <div className="h-6 w-14 bg-gray-100 rounded-md" />
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                          <div className="h-3 w-10 bg-gray-100 rounded" />
                          <div className="h-6 w-20 bg-gray-200 rounded" />
                        </div>
                        <div className="h-10 w-28 bg-indigo-50 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500">Check back later for new additions!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {projects.map((project, index) => (
                <div key={project._id} className="w-full min-w-[300px] max-w-[320px] h-full">
                  <ProjectCard project={project} index={index} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 text-center md:hidden">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Explore All Projects
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
    </div>
  );
}
