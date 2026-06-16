import React from 'react';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[50vh] w-full">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Shifting Boxes */}
        <div className="w-10 h-10 bg-primary rounded-xl absolute animate-shift-box-1 opacity-80 shadow-lg"></div>
        <div className="w-10 h-10 bg-secondary rounded-xl absolute animate-shift-box-2 opacity-80 shadow-lg"></div>
      </div>
      <p className="text-xs font-black tracking-widest uppercase text-base-content/40 animate-pulse mt-4">
        Loading Bytedrop
      </p>
    </div>
  );
};

export default Loading;