'use client';

import React from 'react';
import { FaBookOpen, FaClipboardList } from 'react-icons/fa';
import { CourseData } from '@/lib/courses-db';

interface CourseOverviewSectionProps {
    course: CourseData;
}

export const CourseOverviewSection = ({ course }: CourseOverviewSectionProps) => {
    return (
        <>
            {/* Description / Course Overview */}
            <div className="border-t-3 border-foreground pt-6">
                <h2 className="font-mixtape text-xs uppercase font-extrabold text-foreground/50 tracking-wider">Course Overview</h2>
                <p className="font-mono text-xs text-foreground/80 mt-3 leading-relaxed whitespace-pre-line">
                    {course.description || 'No overview available. Please refer to the official Adelaide University website.'}
                </p>
            </div>

            {/* Prerequisites / Corequisites / Antirequisites */}
            {(course.prerequisites || course.corequisites || course.antirequisites) && (
                <div className="border-t-3 border-foreground pt-5 flex flex-col gap-3">
                    <h2 className="text-sm font-extrabold uppercase text-foreground/50 tracking-wider">Requirements</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {course.prerequisites && (
                            <div className="bg-warning-50/10 border border-warning-200/30 rounded-xl p-3">
                                <p className="text-2xs font-extrabold uppercase text-warning-600 tracking-wider mb-1">Prerequisites</p>
                                <p className="text-xs text-foreground/75 leading-relaxed">{course.prerequisites}</p>
                            </div>
                        )}
                        {course.corequisites && (
                            <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-3">
                                <p className="text-2xs font-extrabold uppercase text-secondary tracking-wider mb-1">Corequisites</p>
                                <p className="text-xs text-foreground/75 leading-relaxed">{course.corequisites}</p>
                            </div>
                        )}
                        {course.antirequisites && (
                            <div className="bg-danger-50/10 border border-danger-200/30 rounded-xl p-3">
                                <p className="text-2xs font-extrabold uppercase text-danger tracking-wider mb-1">Antirequisites</p>
                                <p className="text-xs text-foreground/75 leading-relaxed">{course.antirequisites}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Assessments */}
            {course.assessments && course.assessments.length > 0 && (
                <div className="border-t border-divider pt-5">
                    <h2 className="text-sm font-extrabold uppercase text-foreground/50 tracking-wider mb-3 flex items-center gap-2">
                        <FaClipboardList className="text-primary" /> Assessments
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-divider text-foreground/50 font-extrabold uppercase tracking-wider">
                                    <th className="text-left pb-2 pr-4">Task</th>
                                    <th className="text-right pb-2 pr-4">Weighting</th>
                                    {course.assessments.some(a => a.hurdle) && (
                                        <th className="text-left pb-2">Hurdle</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-divider/40">
                                {course.assessments.map((a, i) => (
                                    <tr key={i} className="text-foreground/75">
                                        <td className="py-2 pr-4 font-semibold">{a.title}</td>
                                        <td className="py-2 pr-4 text-right font-bold text-primary">{a.weighting}</td>
                                        {course.assessments!.some(x => x.hurdle) && (
                                            <td className="py-2 text-foreground/50">{a.hurdle || '—'}</td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className="border-t border-divider pt-5">
                    <h2 className="text-sm font-extrabold uppercase text-foreground/50 tracking-wider mb-3 flex items-center gap-2">
                        <FaBookOpen className="text-primary" /> Learning Outcomes
                    </h2>
                    <ol className="flex flex-col gap-2">
                        {course.learningOutcomes.map((lo) => (
                            <li key={lo.outcomeIndex} className="flex gap-3 text-xs text-foreground/75 leading-relaxed">
                                <span className="font-extrabold text-primary shrink-0 w-5 text-right">{lo.outcomeIndex}.</span>
                                <span>{lo.description}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {/* Textbooks */}
            {course.textbooks && course.textbooks.trim() && course.textbooks.toLowerCase() !== 'no learning resources are required.' && (
                <div className="border-t border-divider pt-5">
                    <h2 className="text-sm font-extrabold uppercase text-foreground/50 tracking-wider mb-2">Textbooks &amp; Resources</h2>
                    <p className="text-xs text-foreground/70 leading-relaxed">{course.textbooks}</p>
                </div>
            )}
        </>
    );
};
