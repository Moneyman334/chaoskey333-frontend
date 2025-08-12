'use client';

interface EvolutionBadgeProps {
  className?: string;
}

export function EvolutionBadge({ className = '' }: EvolutionBadgeProps) {
  // In a real implementation, this would check environment variables or an API
  const isAutoEvolutionActive = process.env.NEXT_PUBLIC_EVOLUTION_AUTO_FEED === 'true';

  if (!isAutoEvolutionActive) {
    return null;
  }

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200 ${className}`}>
      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
      Auto-evolution active
    </div>
  );
}