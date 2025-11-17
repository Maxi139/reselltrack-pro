import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Target, Sparkles, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ResellTrack Pro!',
    description: 'Let\'s take a quick tour to show you how to manage your reselling business effectively.',
    target: 'dashboard-header',
    position: 'bottom'
  },
  {
    id: 'stats',
    title: 'Your Business Overview',
    description: 'These cards show your key metrics - total products, active meetings, revenue, and conversion rate.',
    target: 'stats-grid',
    position: 'bottom'
  },
  {
    id: 'products',
    title: 'Manage Your Products',
    description: 'Click here to view, add, and manage all your products. Track listings, sales, and profits.',
    target: 'products-link',
    position: 'right'
  },
  {
    id: 'meetings',
    title: 'Schedule Meetings',
    description: 'Keep track of client meetings, pickups, and viewings. Never miss an appointment.',
    target: 'meetings-link',
    position: 'right'
  },
  {
    id: 'add-product',
    title: 'Add Your First Product',
    description: 'Click this button to add a new product. You can track purchase price, listing price, and platform.',
    target: 'add-product-btn',
    position: 'top',
    action: 'Click to add product'
  },
  {
    id: 'demo-notice',
    title: 'Demo Mode',
    description: 'You\'re currently in demo mode with sample data. Upgrade to Pro to add your own products and meetings.',
    target: 'demo-banner',
    position: 'bottom'
  }
];

interface TutorialOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function TutorialOverlay({ onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { isDemoMode } = useAuthStore();

  const currentTutorialStep = tutorialSteps[currentStep];

  useEffect(() => {
    // Auto-start tutorial for demo users
    if (isDemoMode) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isDemoMode]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const getTooltipPosition = (target: string, position: string) => {
    const element = document.getElementById(target);
    if (!element) return { top: '50%', left: '50%' };

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const offset = 20;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - tooltipHeight - offset;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - offset;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + offset;
        break;
    }

    // Keep tooltip within viewport
    top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));
    left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));

    return { top: `${top}px`, left: `${left}px` };
  };

  const highlightTarget = (target: string) => {
    // Remove existing highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });

    // Add highlight to current target
    const element = document.getElementById(target);
    if (element) {
      element.classList.add('tutorial-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    if (isVisible) {
      highlightTarget(currentTutorialStep.target);
    }
  }, [currentStep, isVisible, currentTutorialStep.target]);

  if (!isVisible || !isDemoMode) return null;

  const position = getTooltipPosition(currentTutorialStep.target, currentTutorialStep.position);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 tutorial-overlay" />
      
      {/* Highlight */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <div
          id="tutorial-highlight"
          className="absolute border-4 border-blue-400 rounded-lg shadow-lg"
          style={{
            top: position.top,
            left: position.left,
            width: '320px',
            height: '200px',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl p-6 w-80 tutorial-tooltip"
        style={position}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {currentTutorialStep.title}
            </h3>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          {currentTutorialStep.description}
        </p>

        {currentTutorialStep.action && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm text-blue-700 font-medium">
                {currentTutorialStep.action}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500">
              {currentStep + 1} of {tutorialSteps.length}
            </span>
            <button
              onClick={handleNext}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip tour
            </button>
            <button
              onClick={handleComplete}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1 inline" />
                  Finish
                </>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-lg">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-blue-600'
                  : index < currentStep
                  ? 'bg-blue-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .tutorial-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 0.5rem;
        }
        
        .tutorial-overlay {
          backdrop-filter: blur(2px);
        }
        
        .tutorial-tooltip {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}