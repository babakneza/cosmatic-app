'use client';

import { useTranslations } from 'next-intl';
import { CheckoutStep } from '@/store/checkout';

interface CheckoutProgressProps {
    currentStep: CheckoutStep;
    locale: string;
    onStepClick: (step: CheckoutStep) => void;
}

const STEPS: Array<{ key: CheckoutStep; labelKey: string }> = [
    { key: 'shipping', labelKey: 'checkout.step_address' },
    { key: 'shipping_method', labelKey: 'checkout.step_shipping' },
    { key: 'payment', labelKey: 'checkout.step_payment' },
    { key: 'review', labelKey: 'checkout.step_review' },
];

export default function CheckoutProgress({ currentStep, locale, onStepClick }: CheckoutProgressProps) {
    const t = useTranslations();
    const isArabic = locale === 'ar';

    const currentStepIndex = STEPS.findIndex((step) => step.key === currentStep);
    const completedSteps = STEPS.slice(0, currentStepIndex);

    return (
        <div className={`mb-8 ${isArabic ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center justify-between">
                {STEPS.map((step, index) => {
                    const isActive = step.key === currentStep;
                    const isCompleted = index < currentStepIndex;

                    return (
                        <div key={step.key} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <button
                                onClick={() => onStepClick(step.key)}
                                disabled={index > currentStepIndex}
                                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all ${isActive
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : isCompleted
                                            ? 'bg-green-100 border-green-600 text-green-600 cursor-pointer hover:bg-green-200'
                                            : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {isCompleted ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </button>

                            {/* Step Label */}
                            <div className={`ml-3 ${isArabic ? 'mr-3 ml-0' : ''}`}>
                                <p className={`text-xs font-semibold ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                    {t(step.labelKey)}
                                </p>
                            </div>

                            {/* Line between steps */}
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`flex-1 h-1 mx-2 transition-all ${index < currentStepIndex ? 'bg-green-600' : 'bg-gray-300'
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}