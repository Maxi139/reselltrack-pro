import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Smartphone, TrendingUp, Calendar, Star } from 'lucide-react';
import { useAuthStore } from '../store';
import { toast } from 'sonner';

export default function DemoPage() {
  const navigate = useNavigate();
  const { setDemoMode } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "Welcome to ResellTrack Pro Demo",
      description: "Experience all features with pre-loaded demo data. No signup required!",
      icon: <Star className="w-12 h-12 text-yellow-400" />
    },
    {
      title: "Smart Inventory Tracking",
      description: "Track products, calculate profits automatically, and manage your inventory efficiently.",
      icon: <Smartphone className="w-12 h-12 text-primary-600" />
    },
    {
      title: "Advanced Analytics",
      description: "Get insights into your business performance with detailed charts and profit analysis.",
      icon: <TrendingUp className="w-12 h-12 text-success" />
    },
    {
      title: "Meeting Management",
      description: "Schedule and track customer meetings, set reminders, and manage your sales pipeline.",
      icon: <Calendar className="w-12 h-12 text-info" />
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [demoSteps.length]);

  const handleStartDemo = async () => {
    setIsLoading(true);
    
    try {
      // Enable demo mode
      await setDemoMode(true);
      
      toast.success('Demo mode activated!');
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error starting demo:', error);
      toast.error('Failed to start demo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-success-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-700">
      {/* Header */}
      <header className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl mr-4 flex items-center justify-center shadow-glow animate-bounce-in">
                <span className="text-white font-bold text-lg">RT</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">ResellTrack Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="w-24 h-24 bg-gradient-primary rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-glow animate-bounce-in">
              <Star className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 animate-fade-in-up">
              Try 
              <span className="bg-gradient-primary bg-clip-text text-transparent animate-fade-in-up animate-delay-200"> ResellTrack Pro</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto animate-fade-in-up animate-delay-300 leading-relaxed">
              Experience the full power of our platform with pre-loaded demo data. 
              No credit card required, no signup needed!
            </p>
          </motion.div>
        </div>

        {/* Demo Steps Carousel */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-glass p-8 mb-12 border border-white/20 dark:border-slate-700/50 animate-slide-in-up">
          <div className="text-center mb-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex justify-center animate-bounce-in">
                {demoSteps[currentStep].icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white animate-fade-in-up">
                {demoSteps[currentStep].title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
                {demoSteps[currentStep].description}
              </p>
            </motion.div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-2">
            {demoSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-gradient-primary w-8'
                    : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Demo Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-glass border border-white/20 dark:border-slate-700/50">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">What's Included</h3>
            <ul className="space-y-3">
              {[
                "10+ sample products with realistic data",
                "5 scheduled customer meetings",
                "Analytics dashboard with sample metrics",
                "Interactive tutorial system",
                "Full access to all features"
              ].map((item, index) => (
                <li key={index} className="flex items-center text-slate-600 dark:text-slate-300">
                  <Check className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-glass border border-white/20 dark:border-slate-700/50">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Demo Benefits</h3>
            <ul className="space-y-3">
              {[
                "No credit card required",
                "No personal information needed",
                "Realistic business scenarios",
                "Try before you buy",
                "Learn the platform quickly"
              ].map((item, index) => (
                <li key={index} className="flex items-center text-slate-600 dark:text-slate-300">
                  <Check className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={handleStartDemo}
            disabled={isLoading}
            className="btn-primary px-8 py-4 text-lg font-bold group disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Loading Demo...
              </span>
            ) : (
              <span className="flex items-center">
                Start Demo Experience
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
          
          <p className="mt-6 text-slate-600 dark:text-slate-400 text-lg">
            Demo expires in 24 hours • No personal data required
          </p>
        </div>
      </div>
    </div>
  );
}