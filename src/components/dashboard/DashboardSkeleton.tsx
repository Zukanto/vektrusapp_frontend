import React from 'react';

/** Reusable pulse block */
const Bone: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-[var(--vektrus-radius-sm)] bg-[rgba(182,235,247,0.22)] ${className}`} />
);

/** Full-page skeleton mirroring the 4-layer dashboard layout. */
const DashboardSkeleton: React.FC = () => (
  <div className="flex flex-col h-full overflow-hidden bg-[#F4FCFE]">
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10 pt-8 pb-10">

        {/* Hero Header skeleton */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <Bone className="h-7 w-52" />
            <Bone className="h-6 w-28 rounded-full" />
          </div>
          <Bone className="h-4 w-36 hidden sm:block" />
        </div>

        {/* KPI Row skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[var(--vektrus-radius-md)] p-5 shadow-subtle">
              <Bone className="w-9 h-9 mb-3" />
              <Bone className="h-6 w-20 mb-2" />
              <Bone className="h-3 w-24 mb-2" />
              <Bone className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Insight Row skeleton (Layer 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-[var(--vektrus-radius-md)] p-5 shadow-subtle" style={{ borderLeft: '3px solid rgba(182,235,247,0.22)' }}>
              <div className="flex items-center gap-2.5 mb-3">
                <Bone className="w-8 h-8" />
                <Bone className="h-4 w-32" />
              </div>
              <Bone className="h-3 w-full mb-1.5" />
              <Bone className="h-3 w-3/4 mb-4" />
              <Bone className="h-8 w-28 rounded-[var(--vektrus-radius-sm)]" />
            </div>
          ))}
        </div>

        {/* Strategy Row skeleton (Layer 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-7">
          <div className="lg:col-span-5 bg-white rounded-[var(--vektrus-radius-lg)] p-6 shadow-subtle">
            <Bone className="h-4 w-28 mb-5" />
            <div className="flex items-center gap-6">
              <Bone className="w-[140px] h-[140px] rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Bone className="w-2.5 h-2.5 rounded-full" />
                    <Bone className="h-3 w-20" />
                    <Bone className="h-3 w-8 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 bg-white rounded-[var(--vektrus-radius-lg)] p-6 shadow-subtle">
            <Bone className="h-4 w-40 mb-4" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <Bone className="w-8 h-8" />
                <div className="flex-1">
                  <Bone className="h-3 w-24 mb-1.5" />
                  <Bone className="h-1.5 w-full rounded-full" />
                </div>
                <Bone className="h-4 w-10" />
                <Bone className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>

        {/* Task Feed skeleton (Layer 4) */}
        <div className="bg-white rounded-[var(--vektrus-radius-lg)] p-6 shadow-subtle">
          <Bone className="h-4 w-24 mb-4" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Bone className="w-[6px] h-[6px] rounded-full flex-shrink-0" />
              <Bone className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1">
                <Bone className="h-3 w-36 mb-1.5" />
                <Bone className="h-2.5 w-52" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
