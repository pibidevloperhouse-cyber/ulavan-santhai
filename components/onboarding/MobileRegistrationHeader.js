import { LogOut } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

const stages = ["Profile", "Documents", "Review", "Payment"];

export default function MobileRegistrationHeader({ currentStep, onStepClick, onLogout }) {
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
          <h1 className="text-lg font-bold tracking-tight text-[#174B35]">Create your account</h1>
          <span className="text-xs font-medium text-gray-600">Step {currentStep} of {stages.length}</span>
        </div>
        <nav aria-label="Registration steps" className="mt-1 grid grid-cols-4 gap-1.5">
          {stages.map((stage, index) => (
            <button
              key={stage}
              type="button"
              aria-current={currentStep === index + 1 ? "step" : undefined}
              onClick={() => onStepClick(index + 1)}
              className="flex min-h-11 flex-col justify-center gap-1.5 text-left text-xs font-medium text-gray-600 aria-[current=step]:font-bold aria-[current=step]:text-[#174B35]"
            >
              <span className={`h-1 w-full rounded-full ${index < currentStep ? "bg-[#246146]" : "bg-[#dce4d5]"}`} />
              {stage}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
