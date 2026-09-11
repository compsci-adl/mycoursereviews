import Link from 'next/link';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center">
            <div className="border-4 border-foreground p-8 bg-background shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] max-w-lg w-full flex flex-col items-center gap-6 font-mono rotate-[1.5deg] hover:rotate-0 transition-transform duration-200">
                <div className="w-16 h-16 bg-yellow text-black border-3 border-foreground rounded-none flex items-center justify-center shadow-[3px_3px_0px_0px_#000] -rotate-3">
                    <FaExclamationTriangle className="text-2xl animate-warning-scale" />
                </div>
                
                <div>
                    <span className="font-mixtape text-3xl sm:text-4xl uppercase font-black text-white bg-red border-3 border-foreground px-6 py-2.5 w-fit shadow-[4px_4px_0px_0px_#000] rotate-[-2.5deg] inline-block mb-3 select-none">
                        404 - LOST?
                    </span>
                    
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed bg-foreground/5 p-5 rounded-none border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] text-center w-full font-bold uppercase mt-2">
                        This page could not be found. It may have been moved, deleted, or was never offered in the curriculum.
                    </p>
                </div>

                <Link
                    href="/"
                    className="font-mono uppercase font-black text-xs sm:text-sm border-3 border-foreground bg-yellow text-black rounded-none shadow-[4px_4px_0px_0px_#000] rotate-[-1.5deg] hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer h-11 px-6 flex items-center justify-center select-none"
                >
                    &larr; Return Home
                </Link>
            </div>
        </div>
    );
}
