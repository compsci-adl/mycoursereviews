'use client';

import { Select, SelectItem } from '@heroui/react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { FaThumbsDown, FaThumbsUp } from 'react-icons/fa';
import { UPDATE_TERM_OPTIONS, UpdateVoteData } from '@/lib/course-update-voting';

interface LastMajorUpdateSectionProps {
    courseCode: string;
    voteData: UpdateVoteData;
    onVote: (suggestedTerm: string) => Promise<void>;
    voteLoading: boolean;
    onAuthOpen: () => void;
    session: any;
}

export const LastMajorUpdateSection = ({
    voteData,
    onVote,
    voteLoading,
    onAuthOpen,
    session,
}: LastMajorUpdateSectionProps) => {
    const [showDisputeSelector, setShowDisputeSelector] = useState(false);
    const [selectedDisputeTerm, setSelectedDisputeTerm] = useState<string>('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleVoteSubmit = async (term: string) => {
        await onVote(term);
        setShowDisputeSelector(false);
        setSelectedDisputeTerm('');
    };

    return (
        <div className="border-t-3 border-foreground pt-5 flex flex-col gap-3 w-full font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                    <h2 className="font-mixtape text-xs uppercase font-extrabold text-foreground/50 tracking-wider">Last Major Update</h2>
                    <p className="font-mono font-black text-sm text-foreground">{voteData.consensusTerm}</p>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-foreground/50 font-black uppercase">
                    {voteData.totalVotes > 0 && (
                        <span>{voteData.totalVotes} {voteData.totalVotes === 1 ? 'vote' : 'votes'}</span>
                    )}
                </div>
            </div>

            {/* Thumbs voting row */}
            <div className="flex items-center gap-2">
                {/* Thumbs Up — confirms current consensus */}
                <button
                    onClick={() => handleVoteSubmit(voteData.consensusTerm)}
                    disabled={voteLoading}
                    className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground font-mono font-black text-xs uppercase rounded-none transition-all duration-150 cursor-pointer",
                        "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                        voteData.currentUserVote === voteData.consensusTerm
                            ? "bg-yellow text-black border-2 border-foreground shadow-[2px_2px_0px_0px_#000]"
                            : "bg-background text-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-foreground/10"
                    )}
                    title="Confirm — this term looks correct"
                >
                    <FaThumbsUp className="text-[10px]" />
                    <span>Correct</span>
                    {voteData.confirmCount > 0 && (
                        <span className="bg-foreground/15 px-1 rounded-none">{voteData.confirmCount}</span>
                    )}
                </button>

                {/* Thumbs Down — opens dispute selector */}
                <button
                    onClick={() => {
                        if (!session) { onAuthOpen(); return; }
                        setShowDisputeSelector(s => !s);
                        setSelectedDisputeTerm('');
                    }}
                    disabled={voteLoading}
                    className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground font-mono font-black text-xs uppercase rounded-none transition-all duration-150 cursor-pointer",
                        "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                        voteData.currentUserVote && voteData.currentUserVote !== voteData.consensusTerm
                            ? "bg-red text-white border-red shadow-[2px_2px_0px_0px_#d11149]"
                            : "bg-background text-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-red/10"
                    )}
                    title="Dispute — suggest the correct term"
                >
                    <FaThumbsDown className="text-[10px]" />
                    <span>Outdated</span>
                    {voteData.disputeCount > 0 && (
                        <span className="bg-foreground/15 px-1 rounded-none">{voteData.disputeCount}</span>
                    )}
                </button>

                {/* User's current dispute shown as chip */}
                {voteData.currentUserVote && voteData.currentUserVote !== voteData.consensusTerm && !showDisputeSelector && (
                    <span className="font-mono text-[10px] font-black text-red uppercase tracking-wider">
                        You suggested: {voteData.currentUserVote}
                    </span>
                )}
            </div>

            {/* Inline dispute term selector */}
            {showDisputeSelector && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-foreground/5 border-2 border-dashed border-foreground/40 rounded-none mt-1">
                    <span className="font-mono text-[10px] font-black uppercase text-foreground/60 w-full">Select the correct last major update term:</span>
                    {mounted && (() => {
                        const availableTerms = UPDATE_TERM_OPTIONS.filter(t => t !== voteData.consensusTerm);
                        const validSelectedKeys = selectedDisputeTerm && availableTerms.includes(selectedDisputeTerm) ? [selectedDisputeTerm] : [];
                        return (
                            <Select
                                size="sm"
                                radius="none"
                                placeholder="Pick a term..."
                                selectedKeys={validSelectedKeys}
                                onSelectionChange={(keys) => setSelectedDisputeTerm(Array.from(keys)[0] as string)}
                                className="font-mono flex-1 min-w-45 h-10"
                                classNames={{
                                    trigger: "border-2 border-foreground bg-background rounded-none shadow-none h-10 min-h-10 text-foreground",
                                    value: "text-foreground font-mono text-[10px] data-[placeholder=true]:text-grey",
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
                                aria-label="Select correct term"
                            >
                                {availableTerms.map(term => (
                                    <SelectItem key={term} textValue={term} className="font-mono text-xs rounded-none">
                                        {term}
                                    </SelectItem>
                                ))}
                            </Select>
                        );
                    })()}
                    <button
                        onClick={() => selectedDisputeTerm && handleVoteSubmit(selectedDisputeTerm)}
                        disabled={!selectedDisputeTerm || voteLoading}
                        className="font-mono font-black text-xs uppercase px-4 py-2 bg-foreground text-background border-2 border-foreground rounded-none shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:scale-105 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed h-10 cursor-pointer"
                    >
                        Submit
                    </button>
                    <button
                        onClick={() => setShowDisputeSelector(false)}
                        className="font-mono font-black text-xs uppercase px-3 py-2 bg-background text-foreground border-2 border-foreground/40 rounded-none hover:bg-foreground/10 transition-all duration-150 h-10 cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};
