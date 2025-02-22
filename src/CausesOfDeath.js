import React from "react";

const CausesOfDeath = () => {
    const causes = [
        {
            name: "Heart Disease",
            percentage: "21.4%",
            source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm"
        },
        {
            name: "Cancer",
            percentage: "18.5%",
            source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm"
        },
        {
            name: "Accidents (Unintentional Injuries)",
            percentage: "6.9%",
            source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm"
        },
        {
            name: "COVID-19",
            percentage: "5.7%",
            source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm"
        },
        {
            name: "Stroke (Cerebrovascular Diseases)",
            percentage: "5.0%",
            source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm"
        },
        {
            name: "Chronic Lower Respiratory Diseases",
            percentage: "4.5%",
            source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm"
        },
        {
            name: "Alzheimer’s Disease",
            percentage: "3.7%",
            source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm"
        },
        {
            name: "Diabetes",
            percentage: "3.1%",
            source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm"
        },
        {
            name: "Nephritis, Nephrotic Syndrome, and Nephrosis (Kidney Diseases)",
            percentage: "1.8%",
            source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm"
        },
        {
            name: "Chronic Liver Disease and Cirrhosis",
            percentage: "1.6%",
            source: "https://www.cdc.gov/nchs/fastats/leading-causes-of-death.htm"
        }
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Leading Causes of Death in the United States (2022)</h2>
            <ul className="space-y-4">
                {causes.map((cause, index) => (
                    <li key={index} className="p-4 border rounded-lg shadow">
                        <h3 className="text-xl font-semibold">{cause.name}</h3>
                        <p>Percentage of total deaths: {cause.percentage}</p>
                        <p>
                            Source:{" "}
                            <a href={cause.source} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                                CDC - {cause.name}
                            </a>
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CausesOfDeath;