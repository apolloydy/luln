import React, { useMemo, useState } from "react";
import "./styles.css";
import { getBodyDevelopmentFacts } from "./bodyDevelopmentFacts";
import ActionCards from "./components/life/ActionCards";
import FinalLifeCTA from "./components/life/FinalLifeCTA";
import LifeCountdownHero from "./components/life/LifeCountdownHero";
import LifeWeekGrid from "./components/life/LifeWeekGrid";
import MortalityTransition from "./components/life/MortalityTransition";
import TimeBreakdown from "./components/life/TimeBreakdown";
import {
  DEFAULT_BIRTH_DATE,
  DEFAULT_EXPECTED_AGE,
  calculateAgeFromBirthDate,
  calculateLifeStats,
  clampLifeInput,
} from "./components/life/lifeCalculations";
import { getLifeCopy } from "./components/life/lifeCopy";
import { getFuturePredictions } from "./futurePredictions";
import { useLocale } from "./i18n/LocaleProvider";
import { getTechEvents } from "./techEvents";

const STORAGE_KEYS = {
  birthDate: "birthDate",
  expectedAge: "lifeExpectancy",
  legacyBirthDate: "lifeRedesign.birthDate",
  legacyExpectedAge: "lifeRedesign.expectedAge",
};

function getInitialNumber(keys, fallback) {
  const value = keys.map((key) => window.localStorage.getItem(key)).find(Boolean);
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

const LifeExpectancy = () => {
  const { locale, formatDate, formatNumber } = useLocale();
  const [birthDateInput, setBirthDateInput] = useState(
    () => window.localStorage.getItem(STORAGE_KEYS.birthDate) || window.localStorage.getItem(STORAGE_KEYS.legacyBirthDate) || DEFAULT_BIRTH_DATE
  );
  const [expectedAgeInput, setExpectedAgeInput] = useState(() =>
    getInitialNumber([STORAGE_KEYS.expectedAge, STORAGE_KEYS.legacyExpectedAge], DEFAULT_EXPECTED_AGE)
  );
  const currentAge = useMemo(() => calculateAgeFromBirthDate(birthDateInput), [birthDateInput]);
  const input = useMemo(
    () => clampLifeInput(currentAge, expectedAgeInput),
    [currentAge, expectedAgeInput]
  );
  const stats = useMemo(
    () => calculateLifeStats(currentAge, expectedAgeInput),
    [currentAge, expectedAgeInput]
  );
  const techEvents = useMemo(() => getTechEvents(locale), [locale]);
  const bodyDevelopmentFacts = useMemo(() => getBodyDevelopmentFacts(locale), [locale]);
  const futurePredictions = useMemo(() => getFuturePredictions(locale), [locale]);
  const copy = useMemo(() => getLifeCopy(locale), [locale]);

  function handleBirthDateChange(value) {
    setBirthDateInput(value);
    window.localStorage.setItem(STORAGE_KEYS.birthDate, value);
    window.localStorage.setItem(STORAGE_KEYS.legacyBirthDate, value);
  }

  function handleExpectedAgeChange(value) {
    setExpectedAgeInput(value);
    window.localStorage.setItem(STORAGE_KEYS.expectedAge, value);
    window.localStorage.setItem(STORAGE_KEYS.legacyExpectedAge, value);
  }

  function scrollToGrid() {
    document.getElementById("life-week-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="life-redesign-page">
      <LifeCountdownHero
        birthDate={birthDateInput}
        currentAge={currentAge}
        expectedAge={expectedAgeInput}
        stats={stats}
        copy={copy.hero}
        formatNumber={formatNumber}
        onBirthDateChange={handleBirthDateChange}
        onExpectedAgeChange={handleExpectedAgeChange}
        onShowGrid={scrollToGrid}
      />

      <LifeWeekGrid
        percentUsed={stats.percentUsed}
        birthDate={birthDateInput}
        expectedAge={input.expectedAge}
        bodyFactsMap={bodyDevelopmentFacts}
        futurePredictionsMap={futurePredictions}
        techEventsMap={techEvents}
        copy={copy.grid}
        formatDate={formatDate}
      />

      <TimeBreakdown remainingDays={stats.remainingDays} copy={copy.time} formatNumber={formatNumber} />
      <MortalityTransition copy={copy.mortality} />
      <ActionCards copy={copy.actions} />
      <FinalLifeCTA copy={copy.final} />

      <p className="life-redesign-input-note">
        {copy.note
          .replace("{age}", formatNumber(input.currentAge, { maximumFractionDigits: 1 }))
          .replace("{expected}", formatNumber(input.expectedAge))}
      </p>
    </main>
  );
};

export default LifeExpectancy;
