function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatNumberValue(value, metric) {
  if (metric === "paf" || metric === "mortalityReduction" || metric === "shareOfDeaths") {
    return `${Math.round(value * 100)}%`;
  }

  return roundTo(value, 2).toFixed(2);
}

export function formatEffect(effect, t) {
  if (!effect) {
    return "";
  }

  const metricLabel = t(`riskPathways.metrics.${effect.metric}`);
  const numeric = formatNumberValue(effect.value, effect.metric);
  const head = t("riskPathways.edgeLabel", { metric: metricLabel, value: numeric });

  if (effect.ciLow != null && effect.ciHigh != null) {
    const ci = t("riskPathways.ciLabel", {
      low: formatNumberValue(effect.ciLow, effect.metric),
      high: formatNumberValue(effect.ciHigh, effect.metric),
    });
    return `${head} ${ci}`;
  }

  return head;
}

export function formatPaf(paf, t) {
  if (paf == null) {
    return "";
  }

  return t("riskPathways.pafShare", { value: Math.round(paf * 100) });
}
