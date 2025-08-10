#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * Omni-Singularity Architecture Map Builder
 * Fetches PR data from GitHub API and generates the omni_map.json schema
 */

// Configuration
const GITHUB_TOKEN = process.env.OMNI_GITHUB_TOKEN;
const REPO_OWNER = 'Moneyman334';
const REPO_NAME = 'chaoskey333-frontend';
const OUTPUT_PATH = path.join(__dirname, '../data/omni_map.json');

// Broadcast Pulse keywords to identify lineage
const BROADCAST_PULSE_KEYWORDS = [
  'broadcast pulse',
  'cosmic replay',
  'omni-singularity',
  'chaos key',
  'vault',
  'lineage',
  'pulse lineage'
];

class OmniMapBuilder {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.broadcastPulseLineage = [];
  }

  async fetchFromGitHub(endpoint) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/${endpoint}`;
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Omni-Map-Builder/1.0'
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        if (response.status === 403) {
          console.warn('⚠️  Rate limit hit or auth issue. Using minimal data.');
          return [];
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error.message);
      return [];
    }
  }

  async fetchAllPRs() {
    console.log('📡 Fetching Pull Requests...');
    
    // Fetch both open and closed PRs
    const [openPRs, closedPRs] = await Promise.all([
      this.fetchFromGitHub('pulls?state=open&per_page=100'),
      this.fetchFromGitHub('pulls?state=closed&per_page=100')
    ]);

    return [...(openPRs || []), ...(closedPRs || [])];
  }

  isBroadcastPulseRelated(pr) {
    const text = `${pr.title} ${pr.body || ''}`.toLowerCase();
    return BROADCAST_PULSE_KEYWORDS.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
  }

  createNodeFromPR(pr) {
    const isBroadcastPulse = this.isBroadcastPulseRelated(pr);
    
    if (isBroadcastPulse) {
      this.broadcastPulseLineage.push(pr.id.toString());
    }

    return {
      id: pr.id.toString(),
      type: 'pr',
      title: pr.title,
      number: pr.number,
      status: pr.merged_at ? 'merged' : pr.state,
      author: pr.user?.login || 'unknown',
      createdAt: pr.created_at,
      mergedAt: pr.merged_at,
      isBroadcastPulse,
      x: Math.random() * 800 - 400, // Random initial positioning
      y: Math.random() * 600 - 300
    };
  }

  createEdgesBetweenPRs(prs) {
    // Create edges based on temporal relationships and author connections
    const sortedPRs = prs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    for (let i = 1; i < sortedPRs.length; i++) {
      const currentPR = sortedPRs[i];
      const previousPR = sortedPRs[i - 1];
      
      // Connect consecutive PRs
      this.edges.push({
        source: previousPR.id.toString(),
        target: currentPR.id.toString(),
        type: 'temporal'
      });

      // Connect PRs by the same author
      for (let j = 0; j < i; j++) {
        const otherPR = sortedPRs[j];
        if (otherPR.user?.login === currentPR.user?.login && j !== i - 1) {
          this.edges.push({
            source: otherPR.id.toString(),
            target: currentPR.id.toString(),
            type: 'author'
          });
          break; // Only connect to the most recent PR by same author
        }
      }
    }
  }

  async generateMap() {
    console.log('🚀 Building Omni-Singularity Architecture Map...');

    try {
      // Fetch PRs
      const prs = await this.fetchAllPRs();
      console.log(`📊 Found ${prs.length} pull requests`);

      if (prs.length === 0) {
        console.log('🔧 No PRs found, creating minimal map...');
        return this.createMinimalMap();
      }

      // Convert PRs to nodes
      this.nodes = prs.map(pr => this.createNodeFromPR(pr));

      // Create edges between PRs
      this.createEdgesBetweenPRs(prs);

      // Build final map data
      const mapData = {
        metadata: {
          lastUpdated: new Date().toISOString(),
          totalNodes: this.nodes.length,
          totalEdges: this.edges.length,
          broadcastPulseCount: this.broadcastPulseLineage.length
        },
        nodes: this.nodes,
        edges: this.edges,
        broadcastPulseLineage: this.broadcastPulseLineage
      };

      console.log(`✨ Generated map with ${this.nodes.length} nodes and ${this.edges.length} edges`);
      console.log(`🔮 Broadcast Pulse lineage: ${this.broadcastPulseLineage.length} nodes`);

      return mapData;

    } catch (error) {
      console.error('❌ Error generating map:', error);
      return this.createMinimalMap();
    }
  }

  createMinimalMap() {
    return {
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalNodes: 1,
        totalEdges: 0,
        broadcastPulseCount: 0
      },
      nodes: [
        {
          id: 'initial',
          type: 'pr',
          title: 'Initial Repository Setup',
          number: 0,
          status: 'merged',
          author: 'system',
          createdAt: new Date().toISOString(),
          mergedAt: new Date().toISOString(),
          isBroadcastPulse: false,
          x: 0,
          y: 0
        }
      ],
      edges: [],
      broadcastPulseLineage: []
    };
  }

  async saveMap(mapData) {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(OUTPUT_PATH);
      await fs.mkdir(dataDir, { recursive: true });

      // Write map data
      await fs.writeFile(OUTPUT_PATH, JSON.stringify(mapData, null, 2));
      console.log(`💾 Map saved to ${OUTPUT_PATH}`);

      // Also copy to Next.js public directory if it exists
      const nextjsPublicPath = path.join(__dirname, '../chaoskey333/public/omni_map.json');
      try {
        await fs.access(path.dirname(nextjsPublicPath));
        await fs.writeFile(nextjsPublicPath, JSON.stringify(mapData, null, 2));
        console.log(`💾 Map also saved to ${nextjsPublicPath}`);
      } catch (error) {
        console.log(`ℹ️  Next.js public directory not found, skipping copy`);
      }
    } catch (error) {
      console.error('❌ Error saving map:', error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  console.log('⚡ Omni-Singularity Architecture Map Builder');
  console.log('==========================================');

  if (!GITHUB_TOKEN) {
    console.warn('⚠️  OMNI_GITHUB_TOKEN not found. API rate limits may apply.');
  }

  const builder = new OmniMapBuilder();
  
  try {
    const mapData = await builder.generateMap();
    await builder.saveMap(mapData);
    console.log('✅ Omni-Singularity Architecture Map built successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { OmniMapBuilder };