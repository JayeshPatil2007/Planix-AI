'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import SplashIntro from '@/components/views/SplashIntro';
import Onboarding from '@/components/views/Onboarding';
import Workspace from '@/components/views/Workspace';

type AppState = 'splash' | 'onboarding' | 'workspace';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [userData, setUserData] = useState({
    name: '',
    role: ''
  });

  useEffect(() => {
    // Check local storage for user data
    const storedData = localStorage.getItem('planix_user');
    if (storedData) {
      try {
        setUserData(JSON.parse(storedData));
      } catch (e) {
        console.error('Failed to parse user data from local storage');
      }
    }

    // Auto transition from splash to next state
    if (appState === 'splash') {
      const timer = setTimeout(() => {
        if (localStorage.getItem('planix_user')) {
          setAppState('workspace');
        } else {
          setAppState('onboarding');
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const handleOnboardingComplete = (data: any) => {
    setUserData(data);
    localStorage.setItem('planix_user', JSON.stringify(data));
    setAppState('workspace');
  };

  return (
    <main className="min-h-screen w-full overflow-hidden bg-[#030305] relative">
      {/* Global background effects */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(30, 58, 138, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(88, 28, 135, 0.15) 0%, transparent 50%)'
        }}
      />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
          transformOrigin: 'top center'
        }}
      />

      <div className="relative z-10 h-full w-full">
        <AnimatePresence mode="wait">
          {appState === 'splash' && (
            <SplashIntro key="splash" />
          )}
          {appState === 'onboarding' && (
            <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />
          )}
          {appState === 'workspace' && (
            <Workspace key="workspace" userData={userData} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
