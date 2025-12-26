export default function ProjectCardSkeleton() {
    return (
        <div className="w-full min-w-[300px] max-w-[320px] h-full">
            <div className="bg-white rounded-2xl overflow-hidden border border-black shadow-sm flex flex-col h-full animate-pulse">
                {/* Image skeleton */}
                <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                    <div className="absolute top-3 left-3 h-6 w-24 bg-gray-200 rounded-full" />
                </div>

                <div className="p-4 flex flex-col flex-grow">
                    {/* Title and description skeleton */}
                    <div className="mb-2">
                        <div className="h-5 w-3/4 bg-gray-200 rounded" />
                        <div className="mt-2 space-y-2">
                            <div className="h-4 w-full bg-gray-100 rounded" />
                            <div className="h-4 w-5/6 bg-gray-100 rounded" />
                        </div>
                    </div>

                    {/* Rating skeleton */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                        <div className="h-3 w-20 bg-gray-100 rounded" />
                    </div>

                    {/* Tags skeleton */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        <div className="h-6 w-16 bg-gray-100 rounded-md" />
                        <div className="h-6 w-20 bg-gray-100 rounded-md" />
                        <div className="h-6 w-14 bg-gray-100 rounded-md" />
                    </div>

                    {/* Footer skeleton */}
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="h-3 w-10 bg-gray-100 rounded" />
                            <div className="h-6 w-20 bg-gray-200 rounded" />
                        </div>
                        <div className="h-10 w-28 bg-indigo-50 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}
