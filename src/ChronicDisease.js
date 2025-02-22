// ChronicDisease.js
import React from "react";

const ChronicDisease = () => {
    const diseases = [
        {
            name: "Atherosclerotic Diseases",
            description: "Encompasses cardiovascular diseases and cerebrovascular diseases; leading causes of death worldwide.",
        },
        {
            name: "Cancer",
            description: "Various types of malignant tumors; the second leading cause of death globally.",
        },
        {
            name: "Neurodegenerative Diseases",
            description: "Includes conditions like Alzheimer's disease, common among the elderly, with mortality rates increasing with age.",
        },
        {
            name: "Metabolic Diseases",
            description: "Covers disorders such as type 2 diabetes, where patients have a higher mortality risk compared to non-diabetic individuals.",
        },
        {
            name: "Immune System Disorders",
            description: "Declining immune function increases the risk of infections and diseases; for example, patients with systemic lupus erythematosus have higher mortality rates.",
        },
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">The Four Horsemen of Chronic Disease</h2>
            <ul className="space-y-4">
                {diseases.map((disease, index) => (
                    <li key={index} className="p-4 border rounded-lg shadow">
                        <h3 className="text-xl font-semibold">{disease.name}</h3>
                        <p>{disease.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChronicDisease;