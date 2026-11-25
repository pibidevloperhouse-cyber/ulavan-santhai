import { LogOut } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

const defaultStages = ["Profile", "Documents", "Review", "Payment"];
const unlockStages = ["Documents", "Payment"];

export default function MobileRegistrationHeader({
  currentStep,
  onStepClick,
  onLogout,
  isUnlockMode = false,
}) {
  const stages = isUnlockMode ? unlockStages : defaultStages;
  const activeStep = isUnlockMode ? (currentStep === 4 ? 2 : 1) : currentStep;

  return (
    <header className="border-b border-[#dce4d5] bg-white/65 lg:hidden">
      <div className="mx-auto max-w-2xl px-4 pt-2 pb-3">
        <div className="flex items-center justify-between">
          <BrandLogo width={122} priority />
          <button type="button" onClick={onLogout} className="flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-[#174B35]">
            <LogOut size={16} aria-hidden="true" /> Logout
          </button>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <h1 className="text-lg font-bold tracking-tight text-[#174B35]">
            {isUnlockMode ? "Add classification" : "Create your account"}
          </h1>
          <span className="text-xs font-medium text-gray-600">Step {activeStep} of {stages.length}</span>
        </div>
        <nav
          aria-label="Registration steps"
          className={`mt-1 grid gap-1.5 ${isUnlockMode ? "grid-cols-2" : "grid-cols-4"}`}
        >
          {stages.map((stage, index) => {
            const stepNumber = index + 1;
            const targetStep = isUnlockMode ? (index === 0 ? 2 : 4) : stepNumber;
            return (
              <button
                key={stage}
                type="button"
                aria-current={activeStep === stepNumber ? "step" : undefined}
                onClick={() => onStepClick(targetStep)}
                className="flex min-h-11 flex-col justify-center gap-1.5 text-left text-xs font-medium text-gray-600 aria-[current=step]:font-bold aria-[current=step]:text-[#174B35]"
              >
                <span className={`h-1 w-full rounded-full ${index < activeStep ? "bg-[#246146]" : "bg-[#dce4d5]"}`} />
                {stage}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
