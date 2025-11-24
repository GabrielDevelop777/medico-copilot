import { CheckCircle } from "lucide-react";
import type React from "react";

// Interface movida para cá
export interface StepIndicatorProps {
	currentStep: number;
	steps: Array<{
		icon: React.ElementType;
		label: string;
		description: string;
	}>;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
	currentStep,
	steps,
}) => {
	return (
		<div className="flex items-start justify-around px-2 sm:px-4">
			{steps.map((step, index) => {
				const Icon = step.icon;
				const isCompleted = index <= currentStep;
				const isActive = index === currentStep && !isCompleted;

				return (
					<div key={index} className="relative">
						<div className="flex flex-col items-center w-20 sm:w-24">
							<div
								className={`
                w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative overflow-hidden
                ${
									isCompleted
										? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 scale-110"
										: isActive
											? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 scale-110"
											: "bg-slate-800/50 border-2 border-slate-700/50"
								}
              `}
							>
								{(isCompleted || isActive) && (
									<div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
								)}
								{isCompleted ? (
									<CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white relative z-10 animate-bounce" />
								) : (
									<Icon
										className={`h-6 w-6 sm:h-7 sm:w-7 relative z-10 ${
											isActive ? "text-white animate-pulse" : "text-slate-400"
										}`}
									/>
								)}
							</div>
							<div className="mt-2 sm:mt-3 text-center">
								<p
									className={`text-xs sm:text-sm font-semibold transition-colors duration-300 ${
										isCompleted
											? "text-green-400"
											: isActive
												? "text-blue-400"
												: "text-slate-500"
									}`}
								>
									{step.label}
								</p>
								<p className="text-[10px] sm:text-xs text-slate-400 hidden md:block mt-1">
									{step.description}
								</p>
							</div>
						</div>
						{index < steps.length - 1 && (
							<div
								className={`
                absolute top-6 sm:top-7 left-[calc(50%_+_3rem)] sm:left-[calc(50%_+_4rem)] w-[calc(100%_-_2.5rem)] sm:w-[calc(100%_-_3rem)] h-1 -z-10
                hidden md:block rounded-full
                transition-all duration-500 overflow-hidden
                ${index + 1 <= currentStep ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-slate-800/50"}
              `}
							>
								{index + 1 <= currentStep && (
									<div className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
								)}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default StepIndicator;
