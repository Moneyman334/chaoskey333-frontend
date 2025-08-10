'use client';

interface PulseBadgeProps {
  status: 'LIVE' | 'MUTATING' | 'ARCHIVED';
  size?: 'sm' | 'md' | 'lg';
}

export default function PulseBadge({ status, size = 'md' }: PulseBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const statusConfig = {
    LIVE: {
      color: 'bg-green-500',
      textColor: 'text-white',
      label: 'LIVE',
      pulse: true
    },
    MUTATING: {
      color: 'bg-orange-500',
      textColor: 'text-white',
      label: 'MUTATING',
      pulse: true
    },
    ARCHIVED: {
      color: 'bg-gray-500',
      textColor: 'text-gray-200',
      label: 'ARCHIVED',
      pulse: false
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`
      inline-flex items-center rounded-full font-semibold
      ${config.color} ${config.textColor} ${sizeClasses[size]}
      ${config.pulse ? 'animate-pulse' : ''}
    `}>
      <div className={`
        w-2 h-2 rounded-full mr-2
        ${status === 'LIVE' ? 'bg-white animate-ping' : ''}
        ${status === 'MUTATING' ? 'bg-yellow-300 animate-bounce' : ''}
        ${status === 'ARCHIVED' ? 'bg-gray-300' : ''}
      `} />
      {config.label}
    </div>
  );
}