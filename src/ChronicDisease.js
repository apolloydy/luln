import React from "react";

const diseases = [
  {
    name: "Atherosclerotic disease",
    description:
      "Cardiovascular and cerebrovascular disease remain the biggest long-range threats because they build quietly for years before they become obvious.",
  },
  {
    name: "Cancer",
    description:
      "Cancer is not one disease but a family of diseases. Risk changes by age, sex, behavior, screening, and exposure history.",
  },
  {
    name: "Neurodegenerative disease",
    description:
      "Alzheimer disease and related disorders become more common with age and matter because they erode both lifespan and quality of life.",
  },
  {
    name: "Metabolic disease",
    description:
      "Type 2 diabetes, insulin resistance, and obesity often travel together and amplify downstream risk across the whole system.",
  },
  {
    name: "Immune and inflammatory disorders",
    description:
      "Chronic inflammation and immune dysfunction make recovery harder and increase vulnerability across multiple disease categories.",
  },
];

const ChronicDisease = () => {
  return (
    <div className="well-page">
      <section className="well-hero">
        <div>
          <span className="well-eyebrow">Understand The Long Game</span>
          <h1 className="well-title">Most chronic disease is not random. It is cumulative.</h1>
          <p className="well-copy">
            The point of looking at these categories is not to memorize labels. The point is to see
            where long-term risk tends to come from, so prevention stops being abstract.
          </p>
        </div>

        <div className="well-hero-note">
          <strong>What matters</strong>
          <span>These are the categories that quietly shape late-life outcomes.</span>
          <span>They overlap, compound, and usually reward early action.</span>
        </div>
      </section>

      <section className="well-card">
        <div className="well-card-header">
          <div>
            <span className="well-eyebrow">Core Framework</span>
            <h2 className="well-card-title">The five chronic disease fronts worth watching</h2>
            <p className="well-card-copy">
              Think of these as the major fronts where lifespan and healthspan are usually won or lost.
            </p>
          </div>
        </div>

        <div className="horsemen-grid">
          {diseases.map((disease, index) => (
            <article key={disease.name} className="horseman-card">
              <span className="horseman-rank">{`0${index + 1}`}</span>
              <h3>{disease.name}</h3>
              <p>{disease.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ChronicDisease;
