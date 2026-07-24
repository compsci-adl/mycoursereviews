'use client';

import { Button, Chip } from '@heroui/react';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
    FaBuilding,
    FaChalkboardTeacher,
    FaInfoCircle,
    FaCheckSquare,
} from 'react-icons/fa';
import { CourseData } from '@/lib/courses-db';

interface CourseHeaderSectionProps {
    course: CourseData;
}

export const CourseHeaderSection = ({ course }: CourseHeaderSectionProps) => {
    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Back navigation — full width strip above both columns */}
            <div className="flex items-center">
                <Button
                    as={Link}
                    href="/courses"
                    size="sm"
                    variant="flat"
                    className="font-mono uppercase font-black text-xs border-2 border-foreground bg-yellow text-black rounded-none shadow-[3px_3px_0px_0px_#000] rotate-[-2deg] hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                    &larr; Back to Courses
                </Button>
            </div>

            {/* Title Section */}
            <div>
                <span className="font-mixtape text-xs uppercase font-extrabold text-black bg-yellow border-2 border-foreground px-3 py-1 w-fit shadow-[2px_2px_0px_0px_#000] rotate-[-2deg] inline-block">
                    {course.code}
                </span>
                <h1 className="font-mixtape uppercase tracking-tighter text-3xl sm:text-5xl font-black mt-3 leading-none text-foreground">
                    {course.name}
                </h1>
                <div className="flex flex-wrap gap-1.5 mt-4">
                    {course.terms.map((term) => (
                        <Chip
                            key={term}
                            size="sm"
                            radius="none"
                            className={clsx(
                                "border-2 border-foreground font-mono text-3xs font-extrabold",
                                term === 'No Longer Offered'
                                    ? "bg-red text-white animate-pulse-custom"
                                    : "bg-blue text-black"
                            )}
                        >
                            {term}
                        </Chip>
                    ))}
                </div>
            </div>

            {/* No Longer Offered Warning Banner */}
            {course.isNoLongerOffered && (
                <div className="flex items-start gap-3 bg-red/10 border-3 border-red p-4 rounded-none shadow-[3px_3px_0px_0px_#d11149] font-mono">
                    <span className="text-red text-xl mt-0.5 shrink-0">⚠</span>
                    <div className="flex flex-col gap-1">
                        <span className="text-red text-xs font-black uppercase tracking-wider">Course No Longer Offered</span>
                        <p className="text-foreground/80 text-xs leading-relaxed">
                            This course is no longer offered by Adelaide University. Historical student reviews are preserved below for reference only.
                        </p>
                    </div>
                </div>
            )}

            {/* Quick-info pills: coordinator, campus, units, level, elective */}
            {(course.coordinator || course.campus || course.units || course.levelOfStudy || course.universityWideElective) && (
                <div className="flex flex-wrap gap-3 bg-foreground/5 border-2 border-dashed border-foreground/30 p-4 rounded-none font-mono text-xs mt-2">
                    {course.coordinator && (
                        <div className="flex items-center gap-1.5 text-xs font-black bg-red text-white px-2.5 py-1 border-2 border-foreground shadow-[1.5px_1.5px_0px_0px_#000] rotate-[-0.5deg]">
                            <FaChalkboardTeacher />
                            COORDINATOR: {course.coordinator}
                        </div>
                    )}
                    {course.campus && (
                        <div className="flex items-center gap-1.5 text-xs font-black bg-blue text-white px-2.5 py-1 border-2 border-foreground shadow-[1.5px_1.5px_0px_0px_#000] rotate-[0.5deg]">
                            <FaBuilding />
                            CAMPUS: {course.campus}
                        </div>
                    )}
                    {course.units && (
                        <div className="flex items-center gap-1.5 text-xs font-black bg-purple text-white px-2.5 py-1 border-2 border-foreground shadow-[1.5px_1.5px_0px_0px_#000] rotate-[-0.5deg]">
                            <FaInfoCircle />
                            UNITS: {course.units}
                        </div>
                    )}
                    {course.levelOfStudy && (
                        <div className="flex items-center gap-1.5 text-xs font-black bg-orange text-white px-2.5 py-1 border-2 border-foreground shadow-[1.5px_1.5px_0px_0px_#000] rotate-[0.5deg]">
                            <FaChalkboardTeacher />
                            LEVEL: {course.levelOfStudy}
                        </div>
                    )}
                    {course.universityWideElective && (
                        <div className="flex items-center gap-1.5 text-xs font-black bg-yellow text-black px-2.5 py-1 border-2 border-foreground shadow-[1.5px_1.5px_0px_0px_#000] rotate-[-0.5deg]">
                            <FaCheckSquare className="w-3.5 h-3.5 shrink-0" />
                            ELECTIVE: YES
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
