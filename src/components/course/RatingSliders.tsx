'use client';

import { Slider } from '@heroui/react';
import React from 'react';

interface RatingSlidersProps {
    difficultyScore: number;
    setDifficultyScore: (val: number) => void;
    usefulnessScore: number;
    setUsefulnessScore: (val: number) => void;
    enjoymentScore: number;
    setEnjoymentScore: (val: number) => void;
}

export const RatingSliders = ({
    difficultyScore,
    setDifficultyScore,
    usefulnessScore,
    setUsefulnessScore,
    enjoymentScore,
    setEnjoymentScore,
}: RatingSlidersProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-foreground/[0.03] p-4 border-2 border-dashed border-foreground/30">
            {/* Difficulty */}
            <div className="flex flex-col gap-1 font-mono">
                <Slider
                    label="Difficulty"
                    size="md"
                    radius="none"
                    step={0.5}
                    maxValue={5}
                    minValue={0.5}
                    value={difficultyScore}
                    onChange={(val) => setDifficultyScore(val as number)}
                    aria-label="Difficulty slider score"
                    className="w-full"
                    classNames={{
                        track: "border-2 border-foreground h-3 rounded-none bg-foreground/5 dark:bg-foreground/15",
                        filler: "bg-red border-r-2 border-foreground rounded-none",
                        thumb: "rounded-none w-4 h-6 bg-white dark:bg-black border-2 border-foreground shadow-[2px_2px_0px_0px_#000] after:hidden group-data-[dragging=true]:scale-105 transition-all cursor-grab active:cursor-grabbing",
                        label: "text-foreground font-mixtape font-bold text-xs uppercase",
                        value: "text-foreground font-mono font-black text-xs",
                    }}
                />
                <span className="text-2xs text-foreground/60 text-right font-mono font-black uppercase tracking-wider mt-1">
                    {difficultyScore >= 4.5 ? 'Extreme' : difficultyScore >= 3.5 ? 'Hard' : difficultyScore >= 2.5 ? 'Medium' : difficultyScore >= 1.5 ? 'Easy' : 'Trivial'}
                </span>
            </div>

            {/* Usefulness */}
            <div className="flex flex-col gap-1 font-mono">
                <Slider
                    label="Usefulness"
                    size="md"
                    radius="none"
                    step={0.5}
                    maxValue={5}
                    minValue={0.5}
                    value={usefulnessScore}
                    onChange={(val) => setUsefulnessScore(val as number)}
                    aria-label="Usefulness slider score"
                    className="w-full"
                    classNames={{
                        track: "border-2 border-foreground h-3 rounded-none bg-foreground/5 dark:bg-foreground/15",
                        filler: "bg-blue border-r-2 border-foreground rounded-none",
                        thumb: "rounded-none w-4 h-6 bg-white dark:bg-black border-2 border-foreground shadow-[2px_2px_0px_0px_#000] after:hidden group-data-[dragging=true]:scale-105 transition-all cursor-grab active:cursor-grabbing",
                        label: "text-foreground font-mixtape font-bold text-xs uppercase",
                        value: "text-foreground font-mono font-black text-xs",
                    }}
                />
                <span className="text-2xs text-foreground/60 text-right font-mono font-black uppercase tracking-wider mt-1">
                    {usefulnessScore >= 4.5 ? 'Crucial' : usefulnessScore >= 3.5 ? 'Very Useful' : usefulnessScore >= 2.5 ? 'Useful' : usefulnessScore >= 1.5 ? 'Slightly Useful' : 'Useless'}
                </span>
            </div>

            {/* Enjoyment */}
            <div className="flex flex-col gap-1 font-mono">
                <Slider
                    label="Enjoyment"
                    size="md"
                    radius="none"
                    step={0.5}
                    maxValue={5}
                    minValue={0.5}
                    value={enjoymentScore}
                    onChange={(val) => setEnjoymentScore(val as number)}
                    aria-label="Enjoyment slider score"
                    className="w-full"
                    classNames={{
                        track: "border-2 border-foreground h-3 rounded-none bg-foreground/5 dark:bg-foreground/15",
                        filler: "bg-yellow border-r-2 border-foreground rounded-none",
                        thumb: "rounded-none w-4 h-6 bg-white dark:bg-black border-2 border-foreground shadow-[2px_2px_0px_0px_#000] after:hidden group-data-[dragging=true]:scale-105 transition-all cursor-grab active:cursor-grabbing",
                        label: "text-foreground font-mixtape font-bold text-xs uppercase",
                        value: "text-foreground font-mono font-black text-xs",
                    }}
                />
                <span className="text-2xs text-foreground/60 text-right font-mono font-black uppercase tracking-wider mt-1">
                    {enjoymentScore >= 4.5 ? 'Love it' : enjoymentScore >= 3.5 ? 'Great' : enjoymentScore >= 2.5 ? 'Fun' : enjoymentScore >= 1.5 ? 'Okay' : 'Hated it'}
                </span>
            </div>
        </div>
    );
};
