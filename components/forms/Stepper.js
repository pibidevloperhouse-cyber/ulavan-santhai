"use client";

export default function Stepper({
  currentStep,
  steps,
  onStepClick,
  className = "",
  orientation = "vertical",
}) {
  if (orientation === "vertical") {
    return (
      <div className={`flex flex-col py-1 select-none ${className}`}>
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id || idx} className="relative flex flex-col">
              {/* Step Row: Circle + Single Line Title */}
              <div
                className={`flex items-center gap-3 py-1.5 z-10 transition-all ${
                  onStepClick ? "cursor-pointer group" : "cursor-default"
                }`}
                onClick={() => {
                  if (onStepClick) {
                    onStepClick(stepNumber);
                  }
                }}
              >
                {/* Step Circle */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200 ${
                    isCurrent
                      ? "bg-[#174B35] text-white shadow-xs ring-4 ring-[#174B35]/15 scale-105"
                      : isCompleted
                      ? "bg-[#C6E4CC] text-[#174B35] group-hover:bg-[#b2deb9]"
                      : "bg-gray-100 text-gray-400 border border-gray-200/90 group-hover:border-[#174B35]/50 group-hover:text-gray-600"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {/* Step Title - Single line only (subtitle removed per user request) */}
                <span
                  className={`text-xs sm:text-sm font-semibold transition-colors truncate ${
                    isCurrent
                      ? "text-[#174B35] font-bold"
                      : isCompleted
                      ? "text-gray-700 group-hover:text-[#174B35]"
                      : "text-gray-400 font-medium group-hover:text-gray-600"
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Connecting Vertical Line between step circles */}
              {!isLast && (
                <div className="w-8 sm:w-9 flex justify-center py-0.5">
                  <div
                    className={`w-0.5 h-6 sm:h-7 transition-colors duration-300 ${
                      stepNumber < currentStep ? "bg-[#174B35]" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal Stepper fallback (with single line title only as well)
  return (
    <div className={`w-full py-1 ${className}`}>
      {/* Mobile Step Counter */}
      <div className="sm:hidden flex items-center justify-between">
        <h3 className="text-base font-bold text-[#174B35]">
          {steps[currentStep - 1]?.title}
        </h3>
        <div className="h-7 w-7 rounded-full bg-[#174B35] text-white font-bold text-xs flex items-center justify-center">
          {currentStep}/{steps.length}
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="sm:hidden mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-[#174B35] h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      {/* Desktop Horizontal Stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        <div className="absolute top-[18px] left-8 right-8 h-0.5 bg-gray-200 z-0">
          <div
            className="h-full bg-[#174B35] transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={step.id || idx}
              className="flex flex-col items-center relative z-10 cursor-default"
              onClick={() => {
                if (isCompleted && onStepClick) {
                  onStepClick(stepNumber);
                }
              }}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200 ${
                  isCurrent
                    ? "bg-[#174B35] text-white ring-4 ring-[#174B35]/20 shadow-md scale-105"
                    : isCompleted
                    ? "bg-[#C6E4CC] text-[#174B35] hover:bg-[#b2deb9] cursor-pointer"
                    : "bg-gray-100 border border-gray-200 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>

              {/* Step Title - Single line only */}
              <div className="text-center mt-2">
                <span
                  className={`text-xs block transition-colors ${
                    isCurrent
                      ? "text-[#174B35] font-bold"
                      : isCompleted
                      ? "text-gray-700 font-semibold"
                      : "text-gray-400 font-normal"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
