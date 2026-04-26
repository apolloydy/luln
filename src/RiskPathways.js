import React, { useMemo, useState } from "react";
import { useLocale } from "./i18n/LocaleProvider";
import {
  riskPathwayDeathOutcomes,
  riskPathwayDiseases,
  riskPathwayEdges,
  riskPathwayRiskFactors,
  riskPathwaysSources,
} from "./data/wellbing/riskPathways";
import { formatEffect } from "./components/wellbing/riskPathwayFormat";

const STAGE_WIDTH = 1000;
const STAGE_HEIGHT = 620;
const NODE_WIDTH = 220;
const NODE_HEIGHT = 56;
const COLUMN_X = {
  lifestyle: 0,
  disease: STAGE_WIDTH / 2 - NODE_WIDTH / 2,
  mortality: STAGE_WIDTH - NODE_WIDTH,
};
const COLUMN_RIGHT = {
  lifestyle: COLUMN_X.lifestyle + NODE_WIDTH,
  disease: COLUMN_X.disease + NODE_WIDTH,
};

function layoutNodes(items, columnKey, total) {
  const padding = 40;
  const usable = STAGE_HEIGHT - padding * 2;
  const step = total > 1 ? usable / (total - 1) : 0;
  return items.map((item, index) => ({
    ...item,
    column: columnKey,
    x: COLUMN_X[columnKey],
    y: padding + index * step - NODE_HEIGHT / 2,
    cy: padding + index * step,
  }));
}

function buildAggregatedEdges(edges) {
  const groups = new Map();
  edges.forEach((edge) => {
    const key = `${edge.from}->${edge.to}`;
    if (!groups.has(key)) {
      groups.set(key, { from: edge.from, to: edge.to, paf: 0, members: [] });
    }
    const group = groups.get(key);
    group.members.push(edge);
    group.paf = Math.max(group.paf, edge.paf || 0);
  });
  return Array.from(groups.values());
}

function bezierPath(x1, y1, x2, y2) {
  const cpDistance = (x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1 + cpDistance} ${y1}, ${x2 - cpDistance} ${y2}, ${x2} ${y2}`;
}

function strokeWidthFromPaf(paf) {
  const MIN = 1.5;
  const MAX = 12;
  const value = Math.max(0, Math.min(1, paf || 0));
  return MIN + (MAX - MIN) * value;
}

function RiskNode({ node, label, sublabel, isActive, isDimmed, onMouseEnter, onMouseLeave, onFocus, onBlur }) {
  return (
    <g
      className={[
        "risk-node",
        `risk-node-${node.column}`,
        isActive ? "risk-node-active" : "",
        isDimmed ? "risk-node-dimmed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      tabIndex={0}
      role="button"
      aria-label={`${label}${sublabel ? ` — ${sublabel}` : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <rect
        x={node.x}
        y={node.y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={12}
        ry={12}
        fill={node.color || "#1e293b"}
        opacity={0.92}
      />
      <text
        x={node.x + NODE_WIDTH / 2}
        y={node.y + NODE_HEIGHT / 2 - (sublabel ? 4 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        className="risk-node-label"
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={node.x + NODE_WIDTH / 2}
          y={node.y + NODE_HEIGHT / 2 + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          className="risk-node-sublabel"
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

const RiskPathways = () => {
  const { t, formatNumber } = useLocale();
  const [activeNode, setActiveNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  const lifestyleNodes = useMemo(
    () => layoutNodes(riskPathwayRiskFactors, "lifestyle", riskPathwayRiskFactors.length),
    []
  );
  const diseaseNodes = useMemo(
    () => layoutNodes(riskPathwayDiseases, "disease", riskPathwayDiseases.length),
    []
  );
  const mortalityNodes = useMemo(
    () => layoutNodes(riskPathwayDeathOutcomes, "mortality", riskPathwayDeathOutcomes.length),
    []
  );

  const allNodes = useMemo(
    () => [...lifestyleNodes, ...diseaseNodes, ...mortalityNodes],
    [lifestyleNodes, diseaseNodes, mortalityNodes]
  );
  const nodeById = useMemo(() => {
    const map = new Map();
    allNodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [allNodes]);

  const aggregatedEdges = useMemo(() => buildAggregatedEdges(riskPathwayEdges), []);

  const edgesWithGeometry = useMemo(() => {
    return aggregatedEdges
      .map((edge) => {
        const fromNode = nodeById.get(edge.from);
        const toNode = nodeById.get(edge.to);
        if (!fromNode || !toNode) {
          return null;
        }
        const x1 = COLUMN_RIGHT[fromNode.column];
        const y1 = fromNode.cy;
        const x2 = toNode.x;
        const y2 = toNode.cy;
        return {
          ...edge,
          fromNode,
          toNode,
          path: bezierPath(x1, y1, x2, y2),
          midpoint: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
          color: fromNode.color,
          key: `${edge.from}->${edge.to}`,
        };
      })
      .filter(Boolean);
  }, [aggregatedEdges, nodeById]);

  const { activeEdgeKeys, activeNodeIds } = useMemo(() => {
    if (activeNode == null) {
      return { activeEdgeKeys: null, activeNodeIds: null };
    }
    const fromIndex = new Map();
    const toIndex = new Map();
    edgesWithGeometry.forEach((edge) => {
      if (!fromIndex.has(edge.from)) fromIndex.set(edge.from, []);
      if (!toIndex.has(edge.to)) toIndex.set(edge.to, []);
      fromIndex.get(edge.from).push(edge);
      toIndex.get(edge.to).push(edge);
    });

    const edgeKeys = new Set();
    const nodeIds = new Set([activeNode]);
    const activeColumn = nodeById.get(activeNode)?.column;

    if (activeColumn === "lifestyle") {
      (fromIndex.get(activeNode) || []).forEach((edge) => {
        edgeKeys.add(edge.key);
        nodeIds.add(edge.to);
        (fromIndex.get(edge.to) || []).forEach((next) => {
          edgeKeys.add(next.key);
          nodeIds.add(next.to);
        });
      });
    } else if (activeColumn === "disease") {
      (toIndex.get(activeNode) || []).forEach((edge) => {
        edgeKeys.add(edge.key);
        nodeIds.add(edge.from);
      });
      (fromIndex.get(activeNode) || []).forEach((edge) => {
        edgeKeys.add(edge.key);
        nodeIds.add(edge.to);
      });
    } else if (activeColumn === "mortality") {
      (toIndex.get(activeNode) || []).forEach((edge) => {
        edgeKeys.add(edge.key);
        nodeIds.add(edge.from);
        (toIndex.get(edge.from) || []).forEach((prev) => {
          edgeKeys.add(prev.key);
          nodeIds.add(prev.from);
        });
      });
    }

    return { activeEdgeKeys: edgeKeys, activeNodeIds: nodeIds };
  }, [activeNode, edgesWithGeometry, nodeById]);

  const sources = Object.entries(riskPathwaysSources);

  return (
    <div className="well-page risk-pathways-page">
      <section className="well-hero">
        <div>
          <span className="well-eyebrow">{t("riskPathways.heroEyebrow")}</span>
          <h1 className="well-title">{t("riskPathways.heroTitle")}</h1>
          <p className="well-copy">{t("riskPathways.heroCopy")}</p>
        </div>
      </section>

      <section className="well-card">
        <div className="risk-pathways-headers" aria-hidden="true">
          <span>{t("riskPathways.columns.lifestyle")}</span>
          <span>{t("riskPathways.columns.disease")}</span>
          <span>{t("riskPathways.columns.mortality")}</span>
        </div>

        <div className="risk-pathways-stage">
          <svg
            viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            className="risk-pathways-svg"
            role="img"
            aria-label={t("riskPathways.heroTitle")}
          >
            <g className="risk-edges">
              {edgesWithGeometry.map((edge) => {
                const inActiveSet = activeEdgeKeys != null && activeEdgeKeys.has(edge.key);
                const dim = activeEdgeKeys != null && !inActiveSet;
                const highlighted =
                  inActiveSet ||
                  (hoveredEdge && hoveredEdge.from === edge.from && hoveredEdge.to === edge.to);
                return (
                  <g
                    key={`${edge.from}-${edge.to}`}
                    className={[
                      "risk-edge",
                      dim ? "risk-edge-dimmed" : "",
                      highlighted ? "risk-edge-highlight" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseEnter={() => setHoveredEdge(edge)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  >
                    <path
                      d={edge.path}
                      stroke={edge.color || "#64748b"}
                      strokeWidth={strokeWidthFromPaf(edge.paf)}
                      fill="none"
                    />
                    <path
                      d={edge.path}
                      stroke="transparent"
                      strokeWidth={Math.max(strokeWidthFromPaf(edge.paf) + 8, 18)}
                      fill="none"
                    />
                  </g>
                );
              })}
            </g>

            <g className="risk-nodes">
              {lifestyleNodes.map((node) => (
                <RiskNode
                  key={node.id}
                  node={node}
                  label={t(`riskPathways.riskFactors.${node.id}`)}
                  isActive={activeNode === node.id}
                  isDimmed={activeNodeIds != null && !activeNodeIds.has(node.id)}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  onFocus={() => setActiveNode(node.id)}
                  onBlur={() => setActiveNode(null)}
                />
              ))}
              {diseaseNodes.map((node) => (
                <RiskNode
                  key={node.id}
                  node={node}
                  label={t(`riskPathways.diseases.${node.id}`)}
                  isActive={activeNode === node.id}
                  isDimmed={activeNodeIds != null && !activeNodeIds.has(node.id)}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  onFocus={() => setActiveNode(node.id)}
                  onBlur={() => setActiveNode(null)}
                />
              ))}
              {mortalityNodes.map((node) => (
                <RiskNode
                  key={node.id}
                  node={node}
                  label={t(`riskPathways.deathOutcomes.${node.id}`)}
                  sublabel={`${formatNumber(node.deaths)} (${node.percentage}%)`}
                  isActive={activeNode === node.id}
                  isDimmed={activeNodeIds != null && !activeNodeIds.has(node.id)}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  onFocus={() => setActiveNode(node.id)}
                  onBlur={() => setActiveNode(null)}
                />
              ))}
            </g>
          </svg>

          {hoveredEdge && (
            <div
              className="risk-pathways-popover"
              style={{
                left: `${(hoveredEdge.midpoint.x / STAGE_WIDTH) * 100}%`,
                top: `${(hoveredEdge.midpoint.y / STAGE_HEIGHT) * 100}%`,
              }}
            >
              <strong>
                {hoveredEdge.fromNode.column === "lifestyle"
                  ? t(`riskPathways.riskFactors.${hoveredEdge.from}`)
                  : t(`riskPathways.diseases.${hoveredEdge.from}`)}
                {" → "}
                {hoveredEdge.toNode.column === "disease"
                  ? t(`riskPathways.diseases.${hoveredEdge.to}`)
                  : t(`riskPathways.deathOutcomes.${hoveredEdge.to}`)}
              </strong>
              <ul>
                {hoveredEdge.members.map((member) => {
                  const source = riskPathwaysSources[member.sourceId];
                  return (
                    <li key={`${member.sourceId}-${member.effect.metric}-${member.effect.value}`}>
                      <span className="risk-pathways-popover-effect">
                        {formatEffect(member.effect, t)}
                      </span>
                      {source && (
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <p className="risk-pathways-hint">{t("riskPathways.hint")}</p>
      </section>

      <section className="well-card">
        <h2 className="well-card-title">{t("riskPathways.methods.title")}</h2>
        <p className="well-card-copy">{t("riskPathways.methods.body")}</p>
        <ul className="risk-pathways-sources">
          {sources.map(([id, source]) => (
            <li key={id}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
              {source.notes && <span className="risk-pathways-source-note"> — {source.notes}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default RiskPathways;
