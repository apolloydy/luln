import React from "react";
import CausesOfDeath from "./CausesOfDeath";
import CancerStatistics from "./CancerStatistics";
import AccidentCauses from "./AccidentCauses";

const DeathStatistics = () => {
    return (
        <div className="p-6 flex flex-col items-center w-full">
            <h1 className="text-3xl font-bold mb-6 text-white">Death Statistics (2022)</h1>

            {/* Leading Causes of Death */}
            <div className="mb-12 w-full max-w-4xl">
                <h2 className="text-2xl font-semibold mb-4 text-white">Leading Causes of Death</h2>
                <CausesOfDeath />
                <p className="mt-4 text-sm text-gray-400">
                    Source: <a href="https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">CDC - Leading Causes of Death</a>
                </p>
            </div>

            {/* Cancer Statistics */}
            <div className="mb-12 w-full max-w-4xl">
                <h2 className="text-2xl font-semibold mb-4 text-white">Cancer Death Causes</h2>
                <CancerStatistics />
                <p className="mt-4 text-sm text-gray-400">
                    Source: <a href="https://www.cancer.org/research/cancer-facts-statistics.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">American Cancer Society - Cancer Statistics</a>
                </p>
            </div>

            {/* Accidental Causes of Death */}
            <div className="w-full max-w-4xl">
                <h2 className="text-2xl font-semibold mb-4 text-white">Accidental Death Causes</h2>
                <AccidentCauses />
                <p className="mt-4 text-sm text-gray-400">
                    Source: <a href="https://www.cdc.gov/injury/wisqars/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">CDC - WISQARS Injury Data</a>
                </p>
            </div>
        </div>
    );
};

export default DeathStatistics;