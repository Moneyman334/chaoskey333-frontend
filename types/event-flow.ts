// Event Flow Types for Sentinel Event Forge
// Replay-to-Evolution Event Flow TypeScript Interfaces

export interface ReplayEvent {
  replayId: string;
  walletAddress: string;
  proofHash: string;
  nonce: number;
  timestamp: number;
  signature: string;
}

export interface SpectralDecodeResult {
  success: boolean;
  proofHash: string;
  solverSignature: string;
  glyphAlignment: GlyphAlignment[];
  whisperResonance: number;
}

export interface GlyphAlignment {
  glyphId: string;
  position: { x: number; y: number };
  rotation: number;
  resonanceFreq: number;
}

export interface ForgeValidationRequest {
  replayEvent: ReplayEvent;
  decodeResult: SpectralDecodeResult;
}

export interface ForgeValidationResponse {
  valid: boolean;
  mutationSeed?: string;
  errorCode?: string;
  errorMessage?: string;
  cooldownRemaining?: number;
}

export interface EvolutionTrigger {
  mutationSeed: string;
  solverSig: string;
  replayId: string;
  mutationId: string;
  relicTokenId: number;
  evolutionLevel: number;
}

export interface MediaRenderRequest {
  mutationSeed: string;
  relicTokenId: number;
  evolutionLevel: number;
  solverImprint: string;
}

export interface MediaAssetBundle {
  videoUri: string;
  audioUri: string;
  gifUri: string;
  webmUri: string;
  thumbnailUri: string;
  metadata: MediaMetadata;
}

export interface MediaMetadata {
  duration: number;
  resolution: string;
  fileSize: number;
  format: string;
  renderTime: number;
}

export interface NFTMetadataV2 {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  attributes: NFTAttribute[];
  properties: NFTProperties;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface NFTProperties {
  evolution_level: number;
  solver_imprint: string;
  mutation_timestamp: number;
  replay_origin: string;
  rarity_score?: number;
}

export interface VaultArtifact {
  tokenId: number;
  metadata: NFTMetadataV2;
  mediaBundle: MediaAssetBundle;
  evolutionHistory: EvolutionRecord[];
  lastUpdated: number;
}

export interface EvolutionRecord {
  mutationId: string;
  timestamp: number;
  solverAddress: string;
  evolutionLevel: number;
  mediaAssets: string[];
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  timestamp: number;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface TelemetryEvent {
  eventType: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  data: Record<string, any>;
}

// API Route Type Definitions
export interface SpectralHUDAPI {
  '/api/spectral-hud/decode': {
    POST: {
      body: ReplayEvent;
      response: APIResponse<SpectralDecodeResult>;
    };
  };
}

export interface EventForgeAPI {
  '/api/event-forge/validate': {
    POST: {
      body: ForgeValidationRequest;
      response: APIResponse<ForgeValidationResponse>;
    };
  };
}

export interface EvolutionAPI {
  '/api/evolution/trigger': {
    POST: {
      body: EvolutionTrigger;
      response: APIResponse<{ mutationId: string; estimatedCompletion: number }>;
    };
  };
}

export interface VaultAPI {
  '/api/vault/artifact/:tokenId': {
    GET: {
      params: { tokenId: string };
      response: APIResponse<VaultArtifact>;
    };
  };
}

export interface MediaAPI {
  '/api/media/render': {
    POST: {
      body: MediaRenderRequest;
      response: APIResponse<MediaAssetBundle>;
    };
  };
}

export interface NFTAPI {
  '/api/nft/metadata/:tokenId': {
    PUT: {
      params: { tokenId: string };
      body: Partial<NFTMetadataV2>;
      response: APIResponse<NFTMetadataV2>;
    };
  };
}