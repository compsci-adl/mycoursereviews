'use client';

import React from 'react';
import { FaBook, FaBookOpen, FaClipboardList } from 'react-icons/fa';
import { clsx } from 'clsx';
import { CourseData } from '@/lib/courses-db';

interface CourseOverviewSectionProps {
    course: CourseData;
}

const cleanReq = (val?: string | null): string => {
    if (!val || !val.trim() || val.trim().toLowerCase() === 'null' || val.trim().toLowerCase() === 'none') {
        return 'N/A';
    }
    return val.trim();
};

export const CourseOverviewSection = ({ course }: CourseOverviewSectionProps) => {
    const prereqText = cleanReq(course.prerequisites);
    const coreqText = cleanReq(course.corequisites);
    const antireqText = cleanReq(course.antirequisites);
    const hasRequirements =
        prereqText !== 'N/A' ||
        coreqText !== 'N/A' ||
        antireqText !== 'N/A' ||
        Boolean(course.prerequisites || course.corequisites || course.antirequisites);

    const hasMappedOutcomes = course.assessments?.some((a) => Boolean(a.learningOutcomes));

    return (
        <>
            {/* Description / Course Overview */}
            <div className="border-t-3 border-foreground pt-6 flex flex-col gap-2">
                <h2 className="font-mixtape text-xs uppercase font-extrabold text-foreground/50 tracking-wider">
                    Course Overview
                </h2>
                <p className="font-mono text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                    {course.description || 'No overview available. Please refer to the official Adelaide University website.'}
                </p>
            </div>

            {/* Prerequisites / Corequisites / Antirequisites */}
            {hasRequirements && (
                <div className="border-t-3 border-foreground pt-6 flex flex-col gap-3.5">
                    <h2 className="font-mixtape text-xs uppercase font-extrabold text-foreground/50 tracking-wider">
                        Requirements
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {/* Prerequisites */}
                        <div className="bg-background border-2 border-foreground rounded-none p-3.5 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex flex-col justify-between hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform">
                            <div>
                                <span className="bg-yellow text-black border-2 border-foreground px-2 py-0.5 font-mono font-black text-2xs uppercase shadow-[1px_1px_0px_0px_#000] rotate-[-1.5deg] inline-block mb-2.5 select-none">
                                    Prerequisites
                                </span>
                                <p
                                    className={clsx(
                                        'font-mono text-xs leading-relaxed break-words',
                                        prereqText === 'N/A' ? 'text-foreground/40 font-normal' : 'text-foreground/85 font-bold'
                                    )}
                                >
                                    {prereqText}
                                </p>
                            </div>
                        </div>

                        {/* Corequisites */}
                        <div className="bg-background border-2 border-foreground rounded-none p-3.5 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex flex-col justify-between hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform">
                            <div>
                                <span className="bg-purple text-white border-2 border-foreground px-2 py-0.5 font-mono font-black text-2xs uppercase shadow-[1px_1px_0px_0px_#000] rotate-[1.5deg] inline-block mb-2.5 select-none">
                                    Corequisites
                                </span>
                                <p
                                    className={clsx(
                                        'font-mono text-xs leading-relaxed break-words',
                                        coreqText === 'N/A' ? 'text-foreground/40 font-normal' : 'text-foreground/85 font-bold'
                                    )}
                                >
                                    {coreqText}
                                </p>
                            </div>
                        </div>

                        {/* Antirequisites */}
                        <div className="bg-background border-2 border-foreground rounded-none p-3.5 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex flex-col justify-between hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform">
                            <div>
                                <span className="bg-red text-white border-2 border-foreground px-2 py-0.5 font-mono font-black text-2xs uppercase shadow-[1px_1px_0px_0px_#000] -rotate-1 inline-block mb-2.5 select-none">
                                    Antirequisites
                                </span>
                                <p
                                    className={clsx(
                                        'font-mono text-xs leading-relaxed break-words',
                                        antireqText === 'N/A' ? 'text-foreground/40 font-normal' : 'text-foreground/85 font-bold'
                                    )}
                                >
                                    {antireqText}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className="border-t-3 border-foreground pt-6 flex flex-col gap-3.5">
                    <h2 className="font-mixtape text-xs uppercase font-extrabold text-foreground/50 tracking-wider flex items-center gap-2">
                        <FaBookOpen className="text-foreground text-sm" /> Learning Outcomes
                    </h2>
                    <div className="flex flex-col gap-2.5">
                        {course.learningOutcomes.map((lo) => (
                            <div
                                key={lo.outcomeIndex}
                                className="flex gap-3.5 items-start bg-background border-2 border-foreground p-3.5 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] rounded-none hover:translate-x-0.5 transition-transform"
                            >
                                <div className="bg-blue text-white border-2 border-foreground w-6 h-6 flex items-center justify-center font-mono font-black text-2xs shrink-0 shadow-[1px_1px_0px_0px_#000] select-none -rotate-2">
                                    {lo.outcomeIndex}
                                </div>
                                <p className="font-mono text-xs text-foreground/85 leading-relaxed pt-0.5">
                                    {lo.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Assessments */}
            {course.assessments && course.assessments.length > 0 && (
                <div className="border-t-3 border-foreground pt-6 flex flex-col gap-3.5">
                    <h2 className="font-mixtape text-xs uppercase font-extrabold text-foreground/50 tracking-wider flex items-center gap-2">
                        <FaClipboardList className="text-foreground text-sm" /> Assessments
                    </h2>
                    <div className="overflow-x-auto border-2 border-foreground rounded-none shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] bg-background">
                        <table className="w-full text-xs font-mono">
                            <thead>
                                <tr className="bg-foreground/5 border-b-2 border-foreground text-foreground font-black uppercase text-2xs">
                                    <th className="text-left py-2.5 px-4">Task</th>
                                    <th className="text-center py-2.5 px-4">Weighting</th>
                                    <th className="text-center py-2.5 px-4">Hurdle</th>
                                    {hasMappedOutcomes && <th className="text-left py-2.5 px-4">Learning Outcomes</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-foreground/10">
                                {course.assessments.map((a, i) => (
                                    <tr key={i} className="hover:bg-foreground/[0.02] transition-colors">
                                        <td className="py-3 px-4 font-bold text-foreground">{a.title}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="bg-yellow text-black border border-foreground font-black px-2 py-0.5 rounded-none text-2xs shadow-[1px_1px_0px_0px_#000] select-none">
                                                {a.weighting || '—'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {a.hurdle && a.hurdle.trim() !== '' && a.hurdle.toLowerCase() !== 'no' && a.hurdle.toLowerCase() !== 'false' ? (
                                                <span className="bg-red text-white border border-foreground font-black px-1.5 py-0.5 text-3xs uppercase rounded-none shadow-[1px_1px_0px_0px_#000] inline-block">
                                                    {a.hurdle}
                                                </span>
                                            ) : (
                                                <span className="text-foreground/40 text-xs">—</span>
                                            )}
                                        </td>
                                        {hasMappedOutcomes && (
                                            <td className="py-3 px-4 text-2xs">
                                                {a.learningOutcomes ? (
                                                    <span className="bg-blue/15 text-blue-700 dark:text-blue-300 border border-foreground/30 px-1.5 py-0.5 font-bold rounded-none">
                                                        {a.learningOutcomes}
                                                    </span>
                                                ) : (
                                                    <span className="text-foreground/40">—</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Textbooks */}
            {course.textbooks && course.textbooks.trim() && course.textbooks.toLowerCase() !== 'no learning resources are required.' && (
                <div className="border-t-3 border-foreground pt-6 flex flex-col gap-3">
                    <h2 className="font-mixtape text-xs uppercase font-extrabold text-foreground/50 tracking-wider flex items-center gap-2">
                        <FaBook className="text-foreground text-sm" /> Textbooks &amp; Resources
                    </h2>
                    <div className="bg-background border-2 border-foreground p-4 font-mono text-xs text-foreground/80 leading-relaxed rounded-none shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                        {course.textbooks}
                    </div>
                </div>
            )}
        </>
    );
};
