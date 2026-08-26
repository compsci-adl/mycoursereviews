'use client';

import { Autocomplete, AutocompleteItem, Button, Input, Select, SelectItem, Spinner } from '@heroui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import { CourseCard } from './CourseCard';

import { CourseData } from '@/lib/courses-db';
import { Chip } from '@heroui/react';

const PAGE_SIZE = 24;

interface CourseWithStats extends CourseData {
    subject: string;
    avgRating: number;
    avgDifficulty: number;
    avgUsefulness: number;
    avgEnjoyment: number;
    reviewCount: number;
    mostRecentReview: string | null;
    isNoLongerOffered?: boolean;
}

interface BrowseCoursesClientProps {
    courses: CourseWithStats[];
}

const SORT_OPTIONS = [
    { key: 'recent',      label: 'Sort by Most Recent Reviews' },
    { key: 'name-asc',    label: 'Sort by A → Z' },
    { key: 'name-desc',   label: 'Sort by Z → A' },
    { key: 'rating-desc', label: 'Sort by Overall Rating' },
    { key: 'difficulty',  label: 'Sort by Difficulty' },
    { key: 'usefulness',  label: 'Sort by Usefulness' },
    { key: 'enjoyment',   label: 'Sort by Enjoyment' },
] as const;

const ALL_TERMS = ['Semester 1', 'Semester 2', 'Summer', 'Winter', 'No Longer Offered'];

export const BrowseCoursesClient = ({ courses }: BrowseCoursesClientProps) => {
    const [coursesState, setCoursesState] = useState<CourseWithStats[]>(courses);
    const [isPolling, setIsPolling] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
    const [isSubjectAutocompleteOpen, setIsSubjectAutocompleteOpen] = useState(false);
    const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<string>('recent');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [mounted, setMounted] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCoursesState(courses);
    }, [courses]);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        let active = true;
        let timerId: NodeJS.Timeout | null = null;

        const checkStatus = async () => {
            try {
                const res = await fetch('/api/courses');
                if (!res.ok) return;
                const data = await res.json();
                if (!active) return;

                if (Array.isArray(data.courses)) {
                    setCoursesState(data.courses);
                }

                if (!data.isComplete) {
                    setIsPolling(true);
                    timerId = setTimeout(checkStatus, 2000);
                } else {
                    setIsPolling(false);
                }
            } catch (err) {
                console.error('Failed to poll courses status:', err);
                if (active) {
                    timerId = setTimeout(checkStatus, 4000);
                }
            }
        };

        const isShowingFallbacks = courses.length === 5 && courses.every(c => ['COMP SCI 1102', 'COMP SCI 2000', 'COMP SCI 2207', 'COMP SCI 3006', 'COMP SCI 3310'].includes(c.code));
        
        if (isShowingFallbacks) {
            checkStatus();
        } else if (coursesState.length < 100) {
            // Asynchronously load full catalog
            const idleTimer = setTimeout(() => {
                fetch('/api/courses')
                    .then(res => res.json())
                    .then(data => {
                        if (active && data && Array.isArray(data.courses) && data.courses.length > 0) {
                            setCoursesState(data.courses);
                        }
                    })
                    .catch(err => console.error('Failed to background load full course catalog:', err));
            }, 50);

            return () => clearTimeout(idleTimer);
        }

        return () => {
            active = false;
            if (timerId) clearTimeout(timerId);
        };
    }, [courses]);


    // Derive sorted unique subject list — prefer subjectName (full name from API) over code abbreviation
    const allSubjects = useMemo(() => {
        const subjects = new Set(
            coursesState.map((c) => (c.subjectName && c.subjectName.trim()) ? c.subjectName : c.subject)
        );
        return Array.from(subjects).sort();
    }, [coursesState]);

    // Filter logic
    const filteredCourses = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return coursesState.filter((course) => {
            if (query && !(
                course.code.toLowerCase().includes(query) ||
                course.name.toLowerCase().includes(query) ||
                (course.description || '').toLowerCase().includes(query)
            )) return false;

            // Subject multi-filter — match against full subject name or abbreviation
            if (selectedSubjects.size > 0) {
                const courseSubjectName = (course.subjectName && course.subjectName.trim()) ? course.subjectName : course.subject;
                if (!selectedSubjects.has(courseSubjectName)) return false;
            }

            // Term multi-filter
            if (selectedTerms.size > 0) {
                const courseTermsLower = course.terms.map((t) => t.toLowerCase());
                const hasMatchingTerm = Array.from(selectedTerms).some((sel) =>
                    courseTermsLower.some((ct) => ct.includes(sel.toLowerCase()))
                );
                if (!hasMatchingTerm) return false;
            }

            return true;
        });
    }, [coursesState, searchQuery, selectedSubjects, selectedTerms]);

    // Sort logic
    const sortedCourses = useMemo(() => {
        return [...filteredCourses].sort((a, b) => {
            // Push no longer offered courses to the bottom
            if (a.isNoLongerOffered && !b.isNoLongerOffered) return 1;
            if (!a.isNoLongerOffered && b.isNoLongerOffered) return -1;

            switch (sortBy) {
                case 'recent': {
                    if (!a.mostRecentReview && !b.mostRecentReview) return a.name.localeCompare(b.name);
                    if (!a.mostRecentReview) return 1;
                    if (!b.mostRecentReview) return -1;
                    return new Date(b.mostRecentReview).getTime() - new Date(a.mostRecentReview).getTime();
                }
                case 'name-asc':    return a.name.localeCompare(b.name);
                case 'name-desc':   return b.name.localeCompare(a.name);
                case 'rating-desc': return b.avgRating - a.avgRating;
                case 'difficulty':  return b.avgDifficulty - a.avgDifficulty;
                case 'usefulness':  return b.avgUsefulness - a.avgUsefulness;
                case 'enjoyment':   return b.avgEnjoyment - a.avgEnjoyment;
                default:            return 0;
            }
        });
    }, [filteredCourses, sortBy]);

    // Reset visible count when filters/sort change
    useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchQuery, selectedSubjects, selectedTerms, sortBy]);

    const visibleCourses = sortedCourses.slice(0, visibleCount);
    const hasMore = visibleCount < sortedCourses.length;
    const hasActiveFilters = selectedSubjects.size > 0 || selectedTerms.size > 0 || searchQuery.trim().length > 0;

    // Infinite scroll — observe persistent sentinel div at the bottom with scroll fallback
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sortedCourses.length));
                }
            },
            { rootMargin: '400px' }
        );

        observer.observe(el);

        const handleScroll = () => {
            if (!sentinelRef.current) return;
            const rect = sentinelRef.current.getBoundingClientRect();
            if (rect.top <= window.innerHeight + 400) {
                setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sortedCourses.length));
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [hasMore, visibleCount, sortedCourses.length]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSubjects(new Set());
        setSelectedTerms(new Set());
        setSortBy('recent');
    };

    return (
        <div className="flex flex-col gap-8 bg-grid-sheet mx-[-1.5rem] sm:mx-[-2rem] mt-[-2rem] px-6 sm:px-8 py-8 w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] min-h-[calc(100vh-200px)] items-center">
            <div className="max-w-screen-xl w-full flex flex-col gap-8">

            {/* Page Header */}
            <div>
                <h1 className="font-mixtape uppercase tracking-tighter text-3xl sm:text-4xl font-extrabold bg-red text-white w-fit px-4 py-1.5 border-3 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] rotate-[-1deg] select-none hover:rotate-[1deg] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
                    Browse Courses
                </h1>
                <p className="font-mono text-base text-foreground/80 mt-3 font-black rotate-[0.5deg]">
                    Explore student reviews for Adelaide University courses.
                </p>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-col gap-4 bg-background border-4 border-foreground p-5 rounded-none shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <Input
                            isClearable
                            radius="none"
                            placeholder="Search courses (code/title)"
                            startContent={<FaSearch className="text-foreground" />}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            className="w-full font-mono h-10"
                            classNames={{
                                inputWrapper: "border-2 border-foreground bg-background rounded-none shadow-none h-10 group-data-[focus=true]:border-foreground",
                                input: "placeholder:text-grey dark:placeholder:text-grey text-foreground",
                            }}
                        />
                    </div>

                    {/* Subject Autocomplete Search & Select */}
                    {mounted ? (
                        <Autocomplete
                            labelPlacement="outside"
                            radius="none"
                            placeholder="Filter Subject Area"
                            isOpen={isSubjectAutocompleteOpen}
                            onOpenChange={setIsSubjectAutocompleteOpen}
                            onSelectionChange={(key) => {
                                if (key) {
                                    const next = new Set(selectedSubjects);
                                    next.add(key as string);
                                    setSelectedSubjects(next);
                                    setIsSubjectAutocompleteOpen(false);
                                }
                            }}
                            aria-label="Filter by subject area"
                            className="font-mono h-10"
                            classNames={{
                                base: "text-foreground h-10",
                            }}
                            inputProps={{
                                classNames: {
                                    inputWrapper: "border-2 border-foreground bg-background rounded-none shadow-none h-10 group-data-[focus=true]:border-foreground",
                                    input: "placeholder:text-grey text-foreground",
                                }
                            }}
                            popoverProps={{
                                classNames: {
                                    base: "rounded-none",
                                    content: "rounded-none border-3 border-foreground bg-background text-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] p-1"
                                }
                            }}
                            listboxProps={{
                                itemClasses: {
                                    base: "rounded-none data-[hover=true]:bg-secondary data-[hover=true]:text-white font-mono text-xs",
                                }
                            }}
                        >
                            {allSubjects.map((subject) => (
                                <AutocompleteItem key={subject} textValue={subject} className="font-mono text-xs text-foreground rounded-none">
                                    {subject}
                                </AutocompleteItem>
                            ))}
                        </Autocomplete>
                    ) : (
                        <div className="border-2 border-foreground bg-background rounded-none h-10 px-3 flex items-center text-grey dark:text-grey font-mono text-xs select-none pointer-events-none">
                            Filter Subject Area
                        </div>
                    )}

                    {/* Term Multi-Select */}
                    {mounted ? (
                        <Select
                            labelPlacement="outside"
                            radius="none"
                            placeholder="Filter Term"
                            selectionMode="multiple"
                            selectedKeys={selectedTerms}
                            onSelectionChange={(keys) => setSelectedTerms(new Set(keys as unknown as string[]))}
                            aria-label="Filter by term"
                            className="font-mono h-10"
                            classNames={{
                                trigger: "border-2 border-foreground bg-background rounded-none shadow-none h-10 min-h-10 text-foreground",
                                value: "text-foreground font-mono data-[placeholder=true]:text-grey dark:data-[placeholder=true]:text-grey",
                            }}
                            popoverProps={{
                                classNames: {
                                    base: "rounded-none",
                                    content: "rounded-none border-3 border-foreground bg-background text-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] p-1"
                                }
                            }}
                            listboxProps={{
                                itemClasses: {
                                    base: "rounded-none data-[hover=true]:bg-secondary data-[hover=true]:text-white font-mono text-xs",
                                }
                            }}
                        >
                            {ALL_TERMS.map((term) => (
                                <SelectItem key={term} textValue={term} className="font-mono text-xs rounded-none">
                                    {term}
                                </SelectItem>
                            ))}
                        </Select>
                    ) : (
                        <div className="border-2 border-foreground bg-background rounded-none h-10 px-3 flex items-center text-grey dark:text-grey font-mono text-xs select-none pointer-events-none">
                            Filter Term
                        </div>
                    )}

                    {/* Sort By Select */}
                    {mounted ? (
                        <Select
                            radius="none"
                            placeholder="Sort By"
                            selectedKeys={[sortBy]}
                            onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as string)}
                            className="font-mono h-10"
                            aria-label="Sort courses"
                            classNames={{
                                trigger: "border-2 border-foreground bg-background rounded-none shadow-none h-10 min-h-10 text-foreground",
                                value: "text-foreground font-mono data-[placeholder=true]:text-grey dark:data-[placeholder=true]:text-grey",
                            }}
                            popoverProps={{
                                classNames: {
                                    base: "rounded-none",
                                    content: "rounded-none border-3 border-foreground bg-background text-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] p-1"
                                }
                            }}
                            listboxProps={{
                                itemClasses: {
                                    base: "rounded-none data-[hover=true]:bg-secondary data-[hover=true]:text-white font-mono text-xs",
                                }
                            }}
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.key} textValue={opt.label} className="font-mono text-xs rounded-none">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </Select>
                    ) : (
                        <div className="border-2 border-foreground bg-background rounded-none h-10 px-3 flex items-center text-grey dark:text-grey font-mono text-xs select-none pointer-events-none">
                            Sort By
                        </div>
                    )}
                </div>

                {/* Selected Active Filters Chips */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-dashed border-foreground/20">
                        <span className="font-mono text-2xs uppercase font-extrabold text-foreground/70">
                            Active Filters:
                        </span>
                        {Array.from(selectedSubjects).map((sub) => (
                            <Chip
                                key={sub}
                                size="sm"
                                radius="none"
                                onClose={() => {
                                    const next = new Set(selectedSubjects);
                                    next.delete(sub);
                                    setSelectedSubjects(next);
                                }}
                                className="bg-yellow text-black border-2 border-foreground font-mono text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                            >
                                {sub}
                            </Chip>
                        ))}
                        {Array.from(selectedTerms).map((term) => (
                            <Chip
                                key={term}
                                size="sm"
                                radius="none"
                                onClose={() => {
                                    const next = new Set(selectedTerms);
                                    next.delete(term);
                                    setSelectedTerms(next);
                                }}
                                className="bg-blue text-white border-2 border-foreground font-mono text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                            >
                                {term}
                            </Chip>
                        ))}
                        {searchQuery.trim() && (
                            <Chip
                                size="sm"
                                radius="none"
                                onClose={() => setSearchQuery('')}
                                className="bg-foreground text-background border-2 border-foreground font-mono text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                            >
                                &quot;{searchQuery}&quot;
                            </Chip>
                        )}
                        <Button
                            size="sm"
                            variant="light"
                            onPress={clearFilters}
                            startContent={<FaTimes className="text-xs" />}
                            className="font-mono text-xs font-extrabold text-red hover:underline h-7 min-w-0 p-1 ml-auto cursor-pointer"
                        >
                            Clear All
                        </Button>
                    </div>
                )}
            </div>

            {/* Catalog Loading Alert */}
            {isPolling && (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-4 border-foreground bg-yellow/15 dark:bg-yellow/10 p-4 font-mono text-xs shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] border-dashed">
                    <div className="flex items-center gap-2 font-black uppercase text-yellow-600 dark:text-yellow-400">
                        <Spinner size="sm" color="warning" />
                        <span>Updating catalog live ({coursesState.length} loaded)...</span>
                    </div>
                    <span className="text-foreground/85 font-bold italic text-2xs sm:text-xs">
                        Courses are populating in the background. Search results may be incomplete.
                    </span>
                </div>
            )}

            {/* Courses Grid */}
            {sortedCourses.length === 0 ? (
                <div className="text-center py-20 bg-background border-4 border-dashed border-foreground rounded-none">
                    <FaFilter className="text-foreground text-5xl mx-auto mb-4 animate-bounce" />
                    <p className="font-mixtape font-extrabold uppercase text-lg">No courses found</p>
                    <p className="font-mono text-base mt-2">Try updating your filters or search keywords.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleCourses.map((course) => (
                            <CourseCard
                                key={course.code}
                                course={course}
                            />
                        ))}
                    </div>

                    {/* Infinite scroll sentinel */}
                    <div ref={sentinelRef} id="infinite-scroll-sentinel" className="flex justify-center py-8 w-full min-h-[60px]">
                        {hasMore && (
                            <div className="flex items-center gap-2 text-foreground font-mono text-sm font-black uppercase bg-yellow border-3 border-foreground px-4 py-2 shadow-[4px_4px_0px_0px_#000] animate-pulse">
                                <Spinner size="sm" color="current" />
                                <span>Loading more courses...</span>
                            </div>
                        )}
                    </div>
                </>
            )}
            </div>
        </div>
    );
};
