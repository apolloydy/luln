import React from "react";

const measures = [
  {
    title: "Exercise",
    body: [
      "Zone 2 aerobic work builds the base: 20-45 minutes at a sustainable effort improves metabolic and cardiovascular resilience.",
      "VO2 Max matters because reserve capacity matters. Better cardiorespiratory fitness reduces vulnerability across multiple causes of death.",
      "Strength training protects muscle, bone density, metabolic health, and functional independence.",
    ],
  },
  {
    title: "Early cancer screening",
    body: [
      "Screening changes outcomes because timing changes outcomes.",
      "Colorectal, breast, cervical, lung, and prostate screening all matter when done according to evidence-based guidance.",
      "The goal is not to test everything. The goal is to catch the right thing early enough to change the path.",
    ],
    source: {
      label: "American Cancer Society screening guidance",
      url: "https://www.cancer.org/health-care-professionals/american-cancer-society-prevention-early-detection-guidelines.html",
    },
  },
  {
    title: "Sleep",
    body: [
      "Adults generally need 7-9 hours of high-quality sleep.",
      "Poor sleep raises the odds of metabolic dysfunction, cardiovascular strain, mood disruption, and cognitive decline.",
      "Sleep is not downtime. It is maintenance.",
    ],
    source: {
      label: "Sleep Foundation",
      url: "https://www.sleepfoundation.org/how-sleep-works/how-much-sleep-do-we-really-need",
    },
  },
  {
    title: "Stress regulation",
    body: [
      "Meditation, breathing work, and other recovery practices help because chronic stress is biologically expensive.",
      "The point is not spiritual branding. The point is lowering allostatic load.",
    ],
  },
  {
    title: "Diet",
    body: [
      "Reduce ultra-processed foods, excess added sugar, and trans fats.",
      "Bias toward vegetables, fruit, fiber, whole grains, and sufficient protein.",
      "Most diet advice is noisy. The useful part is simple: eat in a way that improves long-term metabolic control.",
    ],
  },
];

const ChronicDiseaseMitigation = () => {
  return (
    <div className="well-page">
      <section className="well-hero">
        <div>
          <span className="well-eyebrow">Change The Trajectory</span>
          <h1 className="well-title">Risk compounds. So do interventions.</h1>
          <p className="well-copy">
            Chronic disease mitigation is not one trick. It is the repeated practice of making the
            body a harder place for disease to win.
          </p>
        </div>

        <div className="well-hero-note">
          <strong>Working principle</strong>
          <span>Small inputs repeated for years beat dramatic plans repeated for weeks.</span>
          <span>Consistency matters more than intensity theater.</span>
        </div>
      </section>

      <section className="well-card">
        <div className="well-card-header">
          <div>
            <span className="well-eyebrow">Practical Levers</span>
            <h2 className="well-card-title">What actually moves the needle</h2>
            <p className="well-card-copy">
              These are not exotic interventions. They are the boring fundamentals that repeatedly show up.
            </p>
          </div>
        </div>

        <div className="mitigation-grid">
          {measures.map((measure) => (
            <article key={measure.title} className="mitigation-card">
              <h3>{measure.title}</h3>
              {measure.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {measure.source ? (
                <a
                  href={measure.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="well-inline-link"
                >
                  {measure.source.label}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <p className="well-note">
        This page is for perspective, not medical diagnosis. Screening and treatment decisions still belong with qualified professionals.
      </p>
    </div>
  );
};

export default ChronicDiseaseMitigation;
