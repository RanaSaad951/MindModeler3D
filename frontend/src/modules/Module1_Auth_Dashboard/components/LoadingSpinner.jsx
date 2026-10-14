const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50 gap-5">
        {/* Layered spinner */}
        <div className="relative w-16 h-16">
          {/* Outer track */}
          <div className="absolute inset-0 rounded-full border-2 border-slate-700/60" />
          {/* Spinning arc */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin-slow" />
          {/* Inner pulse ring */}
          <div className="absolute inset-2 rounded-full border border-cyan-400/20 animate-pulse" />
          {/* Centre dot */}
          <div className="absolute inset-[28%] rounded-full bg-cyan-400/30" />
        </div>

        <div className="text-center">
          <p className="text-slate-300 text-sm font-medium tracking-wide">{message}</p>
          <p className="text-slate-600 text-xs mt-1">Mind Modeler 3D</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2.5 py-2">
      <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin-slow" />
      <span className="text-sm text-slate-400 font-medium">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
