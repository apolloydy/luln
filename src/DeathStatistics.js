import React from "react";
import CausesOfDeath from "./CausesOfDeath";
import AccidentCauses from "./AccidentCauses";

const DeathStatistics = () => {
    return (
        <div className="p-6 flex flex-col items-center w-full">
            <h1 className="text-3xl font-bold mb-6 text-white">Death Statistics (2022)</h1>

            {/* Leading Causes of Death */}
            <div className="mb-12 w-full max-w-4xl">
                <h2 className="text-2xl font-semibold mb-4 text-white">Leading Causes of Death</h2>
                <CausesOfDeath />
            </div>

            {/* Accidental Causes of Death */}
            <div className="w-full max-w-4xl">
                <h2 className="text-2xl font-semibold mb-4 text-white">Accidental Death Causes</h2>
                <AccidentCauses />
            </div>
        </div>
    );
};

export default DeathStatistics;