'use client';

import { clsx } from 'clsx';
import { MdStar } from 'react-icons/md';

interface CourseScorecardProps {
    stats: {
        avgOverall: number;
        avgDifficulty: number;
        avgUsefulness: number;
        avgEnjoyment: number;
        totalReviews: number;
    };
}

export const CourseScorecard = ({ stats }: CourseScorecardProps) => {
    return (
        <div className="border-t-3 border-foreground pt-6 flex flex-col md:flex-row gap-6 items-center md:items-stretch font-mono w-full">
            {/* Overall Rating */}
            <div className="flex flex-col items-center justify-center bg-foreground/5 border-2 border-foreground p-5 rounded-none min-w-45 text-center">
                <h3 className="font-mixtape text-2xs uppercase font-extrabold text-foreground/50 tracking-wider">Overall Score</h3>
                <span className="text-4xl font-mixtape font-black uppercase text-foreground bg-yellow border-2 border-foreground px-4 py-1.5 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] -rotate-2 mt-3.5 select-none hover:rotate-2 hover:scale-105 transition-all duration-200 cursor-pointer">
                    {stats.totalReviews > 0 ? stats.avgOverall.toFixed(1) : 'N/A'}
                </span>
                <div className="flex items-center gap-0.5 text-yellow-500 text-sm mt-3.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <MdStar
                            key={star}
                            className={clsx(
                                'w-4 h-4',
                                stats.totalReviews > 0 && star <= Math.round(stats.avgOverall) ? '' : 'opacity-25 text-foreground'
                            )}
                            fill={stats.totalReviews > 0 && star <= Math.round(stats.avgOverall) ? '#FAA307' : 'currentColor'}
                            stroke="black"
                            strokeWidth={1.2}
                        />
                    ))}
                </div>
                <span className="text-2xs text-foreground/50 mt-2 font-black uppercase leading-none">
                    Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                </span>
            </div>

            {/* EQ Metrics */}
            <div className="flex-1 flex flex-col gap-4 justify-center w-full">
                {/* Difficulty Slider Equivalent */}
                <div className={clsx("flex flex-col gap-1 text-xs", stats.totalReviews === 0 && "opacity-40 select-none")}>
                    <div className="flex justify-between font-black uppercase text-foreground">
                        <span>DIFFICULTY</span>
                        <span>{stats.totalReviews > 0 ? `${stats.avgDifficulty.toFixed(1)} / 5` : 'N/A'}</span>
                    </div>
                    <div className="flex gap-0.5 select-none" aria-hidden="true">
                        {Array.from({ length: 10 }).map((_, segmentIdx) => {
                            const threshold = (segmentIdx + 1) / 2;
                            const active = stats.totalReviews > 0 && stats.avgDifficulty >= threshold;
                            return (
                                <div
                                    key={segmentIdx}
                                    className={clsx(
                                        "h-5 w-full border border-foreground rounded-none transition-all",
                                        active
                                            ? stats.avgDifficulty > 3.5 
                                                ? "bg-red shadow-[1px_1px_0px_0px_#000]" 
                                                : stats.avgDifficulty > 2.5 
                                                    ? "bg-orange shadow-[1px_1px_0px_0px_#000]"
                                                    : "bg-yellow shadow-[1px_1px_0px_0px_#000]"
                                            : "bg-foreground/5"
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Usefulness Slider Equivalent */}
                <div className={clsx("flex flex-col gap-1 text-xs", stats.totalReviews === 0 && "opacity-40 select-none")}>
                    <div className="flex justify-between font-black uppercase text-foreground">
                        <span>USEFULNESS</span>
                        <span>{stats.totalReviews > 0 ? `${stats.avgUsefulness.toFixed(1)} / 5` : 'N/A'}</span>
                    </div>
                    <div className="flex gap-0.5 select-none" aria-hidden="true">
                        {Array.from({ length: 10 }).map((_, segmentIdx) => {
                            const threshold = (segmentIdx + 1) / 2;
                            const active = stats.totalReviews > 0 && stats.avgUsefulness >= threshold;
                            return (
                                <div
                                    key={segmentIdx}
                                    className={clsx(
                                        "h-5 w-full border border-foreground rounded-none transition-all",
                                        active
                                            ? "bg-blue shadow-[1px_1px_0px_0px_#000]"
                                            : "bg-foreground/5"
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Enjoyment Slider Equivalent */}
                <div className={clsx("flex flex-col gap-1 text-xs", stats.totalReviews === 0 && "opacity-40 select-none")}>
                    <div className="flex justify-between font-black uppercase text-foreground">
                        <span>ENJOYMENT</span>
                        <span>{stats.totalReviews > 0 ? `${stats.avgEnjoyment.toFixed(1)} / 5` : 'N/A'}</span>
                    </div>
                    <div className="flex gap-0.5 select-none" aria-hidden="true">
                        {Array.from({ length: 10 }).map((_, segmentIdx) => {
                            const threshold = (segmentIdx + 1) / 2;
                            const active = stats.totalReviews > 0 && stats.avgEnjoyment >= threshold;
                            return (
                                <div
                                    key={segmentIdx}
                                    className={clsx(
                                        "h-5 w-full border border-foreground rounded-none transition-all",
                                        active
                                            ? "bg-yellow shadow-[1px_1px_0px_0px_#000]"
                                            : "bg-foreground/5"
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
