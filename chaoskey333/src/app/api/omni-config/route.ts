import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    omniLinkageEnabled: process.env.OMNI_LINKAGE_ENABLED === 'true',
    omniAutoEvolve: process.env.OMNI_AUTO_EVOLVE === 'true',
    omniRequireSignedApproval: process.env.OMNI_REQUIRE_SIGNED_APPROVAL === 'true',
    omniDebounceMs: parseInt(process.env.OMNI_DEBOUNCE_MS || '1000'),
    omniRateLimitPerMinute: parseInt(process.env.OMNI_RATE_LIMIT_PER_MINUTE || '60'),
  };

  return NextResponse.json(config);
}