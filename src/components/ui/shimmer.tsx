import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
}

export const Shimmer = ({ className }: ShimmerProps) => {
  return (
    <div 
      className={cn(
        "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] rounded",
        className
      )}
      style={{
        animation: 'shimmer 2s ease-in-out infinite',
      }}
    />
  );
};

// Predefined shimmer components
export const ShimmerCard = () => (
  <div className="border rounded-lg p-6 space-y-4">
    <Shimmer className="h-6 w-3/4" />
    <Shimmer className="h-4 w-1/2" />
    <div className="space-y-2">
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-5/6" />
    </div>
  </div>
);

export const ShimmerTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Shimmer className="h-4 w-16" />
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-4 w-20" />
      </div>
    ))}
  </div>
);

export const ShimmerProfile = () => (
  <div className="flex items-center space-x-4">
    <Shimmer className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Shimmer className="h-4 w-32" />
      <Shimmer className="h-3 w-24" />
    </div>
  </div>
);

export const ShimmerStatus = () => (
  <div className="flex items-center justify-between p-6 border rounded-lg">
    <div className="flex items-center gap-4">
      <Shimmer className="h-8 w-8 rounded-full" />
      <div className="space-y-2">
        <Shimmer className="h-5 w-40" />
        <Shimmer className="h-3 w-24" />
      </div>
    </div>
    <div className="space-y-2 text-right">
      <Shimmer className="h-3 w-20" />
      <Shimmer className="h-3 w-24" />
    </div>
  </div>
);

export const ShimmerDocument = () => (
  <div className="border rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <Shimmer className="h-4 w-48" />
      <Shimmer className="h-4 w-4 rounded-full" />
    </div>
    <Shimmer className="h-10 w-full rounded" />
  </div>
);