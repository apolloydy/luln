import React, { useMemo, useState } from "react";
import { useLocale } from "./i18n/LocaleProvider";
import {
  riskPathwayDeathOutcomes,
  riskPathwayDiseases,
  riskPathwayEdges,
  riskPathwayMediators,
  riskPathwayRiskFactors,
  riskPathwaysSources,
} from "./data/wellbing/riskPathways";
import { formatEffect } from "./components/wellbing/riskPathwayFormat";

const STAGE_WIDTH = 1120;
const STAGE_HEIGHT = 820;
const NODE_WIDTH = 176;
const NODE_HEIGHT = 52;
const COLUMN_CENTERS = {
  lifestyle: 88,
  mediator: 392,
  disease: 728,
  mortality: 1032,
};
const COLUMN_X = {
  lifestyle: COLUMN_CENTERS.lifestyle - NODE_WIDTH / 2,
  mediator: COLUMN_CENTERS.mediator - NODE_WIDTH / 2,
  disease: COLUMN_CENTERS.disease - NODE_WIDTH / 2,
  mortality: COLUMN_CENTERS.mortality - NODE_WIDTH / 2,
};
const COLUMN_RIGHT = {
  lifestyle: COLUMN_X.lifestyle + NODE_WIDTH,
  mediator: COLUMN_X.mediator + NODE_WIDTH,
  disease: COLUMN_X.disease + NODE_WIDTH,
};
const LABEL_NAMESPACE = {
  lifestyle: "riskPathways.riskFactors",
  mediator: "riskPathways.mediators",
  disease: "riskPathways.diseases",
  mortality: "riskPathways.deathOutcomes",
};

const DIRECTION_PRIORITY = {
  risk: 3,
  context: 2,
  protective: 1,
  neutral: 0,
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

function evidenceClass(strength) {
  return `risk-edge-evidence-${strength || "moderate"}`;
}

function getNodeLabel(t, node, direction) {
  if (node.column === "mediator" && direction && direction !== "context") {
    return t(`riskPathways.mediatorDirectionLabels.${direction}.${node.id}`);
  }

  return t(`${LABEL_NAMESPACE[node.column]}.${node.id}`);
}

function getDirectionForEdge(edge) {
  return edge.fromNode.direction || edge.members.find((member) => member.direction)?.direction || "neutral";
}

function getDirectionLabel(t, direction) {
  return t(`riskPathways.inputDirections.${direction}`);
}

function RiskNode({ node, label, sublabel, badge, impact, isActive, isDimmed, onMouseEnter, onMouseLeave, onFocus, onBlur }) {
  const hasBadge = Boolean(badge);
  const hasSublabel = Boolean(sublabel);
  const hasImpact = Boolean(impact);
  return (
    <g
      className={[
        "risk-node",
        `risk-node-${node.column}`,
        node.direction ? `risk-node-direction-${node.direction}` : "",
        impact ? `risk-node-impact-${impact}` : "",
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
      {hasImpact && node.column !== "lifestyle" && (
        <g className="risk-node-impact-mark" transform={`translate(${node.x + NODE_WIDTH + 10} ${node.y + 9})`}>
          <circle cx="12" cy="12" r="12" />
          <text x="12" y="12" textAnchor="middle" dominantBaseline="middle">
            {impact === "suppress" ? "↓" : "↑"}
          </text>
        </g>
      )}
      <text
        x={node.x + NODE_WIDTH / 2}
        y={node.y + NODE_HEIGHT / 2 - (hasSublabel ? 4 : hasBadge ? 7 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        className="risk-node-label"
      >
        {label}
      </text>
      {hasBadge && (
        <text
          x={node.x + NODE_WIDTH / 2}
          y={node.y + NODE_HEIGHT / 2 + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          className="risk-node-badge"
        >
          {badge}
        </text>
      )}
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
  const mediatorNodes = useMemo(
    () => layoutNodes(riskPathwayMediators, "mediator", riskPathwayMediators.length),
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
    () => [...lifestyleNodes, ...mediatorNodes, ...diseaseNodes, ...mortalityNodes],
    [lifestyleNodes, mediatorNodes, diseaseNodes, mortalityNodes]
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
          direction: getDirectionForEdge({ fromNode, members: edge.members }),
          path: bezierPath(x1, y1, x2, y2),
          midpoint: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
          color: fromNode.color,
          key: `${edge.from}->${edge.to}`,
        };
      })
      .filter(Boolean);
  }, [aggregatedEdges, nodeById]);

  const { activeEdgeKeys, activeNodeIds, activeEdgeDirectionByKey, activeNodeDirections, activeColumn } = useMemo(() => {
    if (activeNode == null) {
      return {
        activeEdgeKeys: null,
        activeNodeIds: null,
        activeEdgeDirectionByKey: new Map(),
        activeNodeDirections: new Map(),
        activeColumn: null,
      };
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
    const edgeDirections = new Map();
    const nodeDirections = new Map();
    const currentActiveColumn = nodeById.get(activeNode)?.column;

    if (currentActiveColumn === "lifestyle") {
      const startDirection = nodeById.get(activeNode)?.direction || "neutral";
      const queue = [{ nodeId: activeNode, direction: startDirection }];
      nodeDirections.set(activeNode, startDirection);
      while (queue.length > 0) {
        const { nodeId, direction } = queue.shift();
        (fromIndex.get(nodeId) || []).forEach((edge) => {
          const edgeDirection = direction;
          edgeKeys.add(edge.key);
          edgeDirections.set(edge.key, edgeDirection);
          nodeIds.add(edge.from);
          nodeDirections.set(edge.from, edgeDirection);
          if (!nodeIds.has(edge.to)) {
            nodeIds.add(edge.to);
            nodeDirections.set(edge.to, edgeDirection);
            queue.push({ nodeId: edge.to, direction: edgeDirection });
          } else if (
            DIRECTION_PRIORITY[edgeDirection] > DIRECTION_PRIORITY[nodeDirections.get(edge.to) || "neutral"]
          ) {
            nodeDirections.set(edge.to, edgeDirection);
          }
        });
      }
    } else {
      [...(fromIndex.get(activeNode) || []), ...(toIndex.get(activeNode) || [])].forEach((edge) => {
        edgeKeys.add(edge.key);
        edgeDirections.set(edge.key, edge.direction);
        nodeIds.add(edge.from);
        nodeIds.add(edge.to);
        nodeDirections.set(edge.from, edge.direction);
        nodeDirections.set(edge.to, edge.direction);
      });
    }

    return {
      activeEdgeKeys: edgeKeys,
      activeNodeIds: nodeIds,
      activeEdgeDirectionByKey: edgeDirections,
      activeNodeDirections: nodeDirections,
      activeColumn: currentActiveColumn,
    };
  }, [activeNode, edgesWithGeometry, nodeById]);

  const showInputDirectionEffects = activeColumn === "lifestyle";

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
          <span>{t("riskPathways.columns.mediator")}</span>
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
                const displayDirection = showInputDirectionEffects
                  ? activeEdgeDirectionByKey.get(edge.key) || edge.direction
                  : edge.direction;
                const impactClass =
                  displayDirection === "protective"
                    ? "risk-edge-impact-suppress"
                    : displayDirection === "risk"
                      ? "risk-edge-impact-amplify"
                      : "";
                const highlighted =
                  inActiveSet ||
                  (hoveredEdge && hoveredEdge.from === edge.from && hoveredEdge.to === edge.to);
                return (
                  <g
                    key={`${edge.from}-${edge.to}`}
                    className={[
                      "risk-edge",
                      `risk-edge-direction-${displayDirection}`,
                      impactClass,
                      evidenceClass(edge.members[0]?.evidenceStrength),
                      dim ? "risk-edge-dimmed" : "",
                      highlighted ? "risk-edge-highlight" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  onMouseEnter={() => setHoveredEdge({ ...edge, direction: displayDirection })}
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
                  label={getNodeLabel(t, node)}
                  badge={t(`riskPathways.inputDirections.${node.direction}`)}
                  isActive={activeNode === node.id}
                  isDimmed={activeNodeIds != null && !activeNodeIds.has(node.id)}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  onFocus={() => setActiveNode(node.id)}
                  onBlur={() => setActiveNode(null)}
                />
              ))}
              {mediatorNodes.map((node) => (
                (() => {
                  const direction = activeNodeDirections.get(node.id);
                  const impact = showInputDirectionEffects && direction === "protective" ? "suppress" : showInputDirectionEffects && direction === "risk" ? "amplify" : null;
                  return (
                <RiskNode
                  key={node.id}
                  node={{ ...node, direction: showInputDirectionEffects ? direction : null }}
                  label={getNodeLabel(t, node, showInputDirectionEffects ? direction : null)}
                  badge={showInputDirectionEffects && direction ? getDirectionLabel(t, direction) : null}
                  impact={impact}
                  isActive={activeNode === node.id}
                  isDimmed={activeNodeIds != null && !activeNodeIds.has(node.id)}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  onFocus={() => setActiveNode(node.id)}
                  onBlur={() => setActiveNode(null)}
                />
                  );
                })()
              ))}
              {diseaseNodes.map((node) => (
                (() => {
                  const direction = activeNodeDirections.get(node.id);
                  const impact = showInputDirectionEffects && direction === "protective" ? "suppress" : showInputDirectionEffects && direction === "risk" ? "amplify" : null;
                  return (
                <RiskNode
                  key={node.id}
                  node={{ ...node, direction: showInputDirectionEffects ? direction : null }}
                  label={getNodeLabel(t, node, showInputDirectionEffects ? direction : null)}
                  badge={showInputDirectionEffects && direction ? getDirectionLabel(t, direction) : null}
                  impact={impact}
                  isActive={activeNode === node.id}
                  isDimmed={activeNodeIds != null && !activeNodeIds.has(node.id)}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  onFocus={() => setActiveNode(node.id)}
                  onBlur={() => setActiveNode(null)}
                />
                  );
                })()
              ))}
              {mortalityNodes.map((node) => (
                (() => {
                  const direction = activeNodeDirections.get(node.id);
                  const impact = showInputDirectionEffects && direction === "protective" ? "suppress" : showInputDirectionEffects && direction === "risk" ? "amplify" : null;
                  return (
                <RiskNode
                  key={node.id}
                  node={{ ...node, direction: showInputDirectionEffects ? direction : null }}
                  label={getNodeLabel(t, node)}
                  sublabel={`${formatNumber(node.deaths)} (${node.percentage}%)`}
                  impact={impact}
                  isActive={activeNode === node.id}
                  isDimmed={activeNodeIds != null && !activeNodeIds.has(node.id)}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  onFocus={() => setActiveNode(node.id)}
                  onBlur={() => setActiveNode(null)}
                />
                  );
                })()
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
                {getNodeLabel(t, hoveredEdge.fromNode, hoveredEdge.direction)}
                {" → "}
                {getNodeLabel(t, hoveredEdge.toNode, hoveredEdge.direction)}
              </strong>
              <ul>
                {hoveredEdge.members.map((member) => {
                  const source = riskPathwaysSources[member.sourceId];
                  return (
                    <li key={`${member.sourceId}-${member.effect.metric}-${member.effect.value}`}>
                      <span className="risk-pathways-popover-effect">
                        {formatEffect(member.effect, t)}
                      </span>
                      <span className={`risk-pathways-evidence ${evidenceClass(member.evidenceStrength)}`}>
                        {t(`riskPathways.evidence.${member.evidenceStrength}`)}
                      </span>
                      <span className={`risk-pathways-direction-note risk-pathways-direction-${hoveredEdge.direction}`}>
                        {t(`riskPathways.directionNotes.${hoveredEdge.direction}`)}
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

        <div className="risk-pathways-legend" aria-label={t("riskPathways.legend.title")}>
          <span className="risk-pathways-legend-title">{t("riskPathways.legend.title")}</span>
          <span className="risk-pathways-legend-item">
            <i className="risk-pathways-legend-line risk-pathways-legend-protective" />
            {t("riskPathways.legend.protective")}
          </span>
          <span className="risk-pathways-legend-item">
            <i className="risk-pathways-legend-line risk-pathways-legend-risk" />
            {t("riskPathways.legend.risk")}
          </span>
          <span className="risk-pathways-legend-item">
            <i className="risk-pathways-legend-line risk-pathways-legend-context" />
            {t("riskPathways.legend.context")}
          </span>
          <span className="risk-pathways-legend-item">
            <i className="risk-pathways-legend-line risk-pathways-legend-strong" />
            {t("riskPathways.legend.strong")}
          </span>
          <span className="risk-pathways-legend-item">
            <i className="risk-pathways-legend-line risk-pathways-legend-dashed" />
            {t("riskPathways.legend.moderateEmerging")}
          </span>
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
