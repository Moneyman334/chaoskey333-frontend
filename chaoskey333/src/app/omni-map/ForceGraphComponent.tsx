"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  type: string;
  title: string;
  number: number;
  status: 'open' | 'merged' | 'closed';
  author: string;
  createdAt: string;
  mergedAt?: string;
  isBroadcastPulse: boolean;
  x?: number;
  y?: number;
}

interface Edge {
  source: string | Node;
  target: string | Node;
  type: string;
}

interface OmniMapData {
  metadata: {
    lastUpdated: string;
    totalNodes: number;
    totalEdges: number;
    broadcastPulseCount: number;
  };
  nodes: Node[];
  edges: Edge[];
  broadcastPulseLineage: string[];
}

interface ForceGraphComponentProps {
  data: OmniMapData;
  isDarkTheme: boolean;
  onNodeClick: (node: Node) => void;
}

export default function ForceGraphComponent({ data, isDarkTheme, onNodeClick }: ForceGraphComponentProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const getNodeColor = (node: Node) => {
    if (node.isBroadcastPulse) {
      return '#00FFFF'; // Cyan for Broadcast Pulse lineage
    }
    
    switch (node.status) {
      case 'open':
        return '#22C55E'; // Green for open PRs
      case 'merged':
        return '#8B5CF6'; // Purple for merged PRs
      case 'closed':
        return '#EF4444'; // Red for closed PRs
      default:
        return '#6B7280'; // Gray for unknown status
    }
  };

  const getNodeSize = (node: Node) => {
    return node.isBroadcastPulse ? 12 : 8;
  };

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = window.innerWidth;
    const height = window.innerHeight - 300;

    svg.attr("width", width).attr("height", height);

    // Set background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", isDarkTheme ? "#000000" : "#ffffff");

    // Create tooltip
    const tooltip = d3.select("body").selectAll<HTMLDivElement, number>(".omni-tooltip").data([0]);
    const tooltipEnter = tooltip.enter().append("div").attr("class", "omni-tooltip");
    const tooltipDiv = tooltipEnter.merge(tooltip as any)
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.9)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("font-family", "system-ui, -apple-system, sans-serif")
      .style("font-size", "14px")
      .style("z-index", "1000")
      .style("max-width", "250px");

    // Create simulation
    const simulation = d3.forceSimulation(data.nodes as any)
      .force("link", d3.forceLink(data.edges).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create container for zoom
    const container = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    // Create links
    const link = container.append("g")
      .selectAll<SVGLineElement, Edge>("line")
      .data(data.edges)
      .enter().append("line")
      .attr("stroke", isDarkTheme ? "#374151" : "#9CA3AF")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    // Create nodes
    const node = container.append("g")
      .selectAll<SVGCircleElement, Node>("circle")
      .data(data.nodes)
      .enter().append("circle")
      .attr("r", getNodeSize)
      .attr("fill", getNodeColor)
      .attr("stroke", (d: Node) => d.isBroadcastPulse ? "#00FFFF" : isDarkTheme ? "#ffffff" : "#000000")
      .attr("stroke-width", (d: Node) => d.isBroadcastPulse ? 3 : 1)
      .style("cursor", "pointer")
      .on("click", (event, d) => onNodeClick(d))
      .on("mouseover", (event, d) => {
        tooltipDiv.transition().duration(200).style("opacity", 1);
        tooltipDiv.html(`
          <div style="font-weight: bold; margin-bottom: 4px; border-bottom: 1px solid #666; padding-bottom: 4px;">
            ${d.number > 0 ? `PR #${d.number}` : d.title}
          </div>
          <div style="font-style: italic; margin-bottom: 8px; color: #ccc;">
            ${d.title}
          </div>
          <div style="font-size: 12px;">
            <div>Author: ${d.author}</div>
            <div>Status: <span style="color: ${getNodeColor(d)};">${d.status}</span></div>
            <div>Created: ${new Date(d.createdAt).toLocaleDateString()}</div>
            ${d.isBroadcastPulse ? '<div style="color: #00FFFF; margin-top: 4px;">🔮 Broadcast Pulse Lineage</div>' : ''}
          </div>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", () => {
        tooltipDiv.transition().duration(200).style("opacity", 0);
      });

    // Add node labels
    const label = container.append("g")
      .selectAll<SVGTextElement, Node>("text")
      .data(data.nodes)
      .enter().append("text")
      .text((d: Node) => d.number > 0 ? `#${d.number}` : "Init")
      .attr("font-size", "10px")
      .attr("font-family", "system-ui, -apple-system, sans-serif")
      .attr("fill", isDarkTheme ? "#ffffff" : "#000000")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("pointer-events", "none");

    // Add drag behavior
    const drag = d3.drag()
      .on("start", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag as any);

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      label
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    // Cleanup function
    return () => {
      simulation.stop();
      tooltipDiv.remove();
    };
  }, [data, isDarkTheme, onNodeClick]);

  return (
    <div className="w-full relative">
      <svg
        ref={svgRef}
        className="w-full"
        style={{ 
          minHeight: '600px',
          background: isDarkTheme ? '#000000' : '#ffffff'
        }}
      />
      <div className="absolute bottom-4 right-4 text-xs text-gray-500">
        💡 Drag nodes • Click to view PR • Scroll to zoom
      </div>
    </div>
  );
}