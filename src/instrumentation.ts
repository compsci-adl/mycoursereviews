export async function register() {
    // Only execute on the Node.js server runtime
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            const { CoursesApiClient } = await import('./lib/courses-api');
            console.log('Server Boot: Triggering initial courses prefetch...');
            
            // Initial prefetch on startup
            CoursesApiClient.getAllCourses()
                .then(() => console.log('Server Boot: Courses prefetch query initiated.'))
                .catch((err) => console.error('Server Boot: Failed during prefetch initiation:', err));

            // Schedule proactive revalidation every 24 hours (86400000 ms)
            setInterval(() => {
                console.log('Scheduled Revalidation: Triggering daily course prefetch...');
                CoursesApiClient.prefetchAllCoursesInBackground()
                    .then(() => console.log('Scheduled Revalidation: Daily course prefetch completed.'))
                    .catch((err) => console.error('Scheduled Revalidation: Daily course prefetch failed:', err));
            }, 86400000);
        } catch (error) {
            console.error('Server Boot: Failed to load CoursesApiClient in register hook:', error);
        }
    }
}
