export default function CoursesLoading() {
    return (
        <div className="flex flex-col gap-8 bg-grid-sheet mx-[-1.5rem] sm:mx-[-2rem] mt-[-2rem] px-6 sm:px-8 py-8 w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] min-h-[calc(100vh-200px)] items-center">
            <div className="max-w-screen-xl w-full flex flex-col gap-8">
                {/* Page Header Skeleton */}
                <div>
                    <div className="h-10 w-56 bg-red border-3 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] animate-pulse rotate-[-1deg]" />
                    <div className="h-5 w-80 bg-foreground/20 border border-foreground/30 mt-3 font-mono animate-pulse" />
                </div>

                {/* Filter and Search Controls Skeleton */}
                <div className="flex flex-col gap-4 bg-background border-4 border-foreground p-5 rounded-none shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="h-10 bg-foreground/10 border-2 border-foreground rounded-none animate-pulse" />
                        <div className="h-10 bg-foreground/10 border-2 border-foreground rounded-none animate-pulse" />
                        <div className="h-10 bg-foreground/10 border-2 border-foreground rounded-none animate-pulse" />
                        <div className="h-10 bg-foreground/10 border-2 border-foreground rounded-none animate-pulse" />
                    </div>
                </div>

                {/* Courses Grid Skeletons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="bg-background border-4 border-foreground rounded-none shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] p-4 flex flex-col justify-between h-[155px] animate-pulse gap-3"
                        >
                            <div className="flex justify-between items-start">
                                <div className="h-6 w-24 bg-yellow/40 border-2 border-foreground/50" />
                                <div className="h-6 w-16 bg-yellow/40 border-2 border-foreground/50" />
                            </div>
                            <div className="h-5 w-3/4 bg-foreground/15 border border-foreground/20" />
                            <div className="flex gap-2 mt-auto">
                                <div className="h-5 w-20 bg-blue/30 border border-foreground/30" />
                                <div className="h-5 w-20 bg-blue/30 border border-foreground/30" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
