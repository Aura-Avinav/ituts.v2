import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { HabitGrid } from './components/HabitGrid';
import { AchievementBoard } from './components/AchievementBoard';
import { TodoBoard } from './components/TodoBoard';
import { JournalEditor } from './components/JournalEditor';
import { MetricGraph } from './components/MetricGraph';
import { YearView } from './components/YearView';
import { SettingsView } from './components/SettingsView';
import { getDaysInMonth, differenceInCalendarDays, startOfYear, endOfYear, format } from 'date-fns';
import { useStore } from './hooks/useStore';

import { PageTransition } from './components/ui/PageTransition';
import { Loading } from './components/ui/Loading';
import { SplashScreen } from './components/ui/SplashScreen';
import { AnimatePresence } from 'framer-motion';
import { useDynamicFavicon } from './hooks/useDynamicFavicon';
import { MoodSelector } from './components/MoodSelector';

type ViewState = 'dashboard' | 'journal' | 'achievements' | 'year' | 'settings';

function App() {
  useDynamicFavicon();
  const [view, setView] = useState<ViewState>(() => {
    if (typeof window !== 'undefined') {
      const isNewSession = !sessionStorage.getItem('ituts_session_started');
      
      if (isNewSession) {
        // Mark session as started
        sessionStorage.setItem('ituts_session_started', 'true');
        
        // 1. New Session: Use User's Default Page Preference
        try {
          const prefs = JSON.parse(localStorage.getItem('ituts_preferences_v1') || '{}');
          if (prefs.startView) {
            return prefs.startView;
          }
        } catch (e) { /* ignore */ }
        return 'dashboard'; // Default if no preference
      } else {
        // 2. Existing Session (Refresh): Restore Last Open View
        const savedView = localStorage.getItem('journal_current_view');
        return (savedView as ViewState) || 'dashboard';
      }
    }
    return 'dashboard';
  });

  useEffect(() => {
    // Don't save 'settings' as the current view to return to, strictly speaking, or maybe yes?
    // For now, keep saving all.
    localStorage.setItem('journal_current_view', view);
  }, [view]);



  const [currentDate, setCurrentDate] = useState(new Date());
  const { data, user, authLoading } = useStore();
  
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Midnight Reset Logic: Check every minute if the day has changed
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate() || now.getMonth() !== currentDate.getMonth()) {
        setCurrentDate(new Date());
      }
    };

    const timer = setInterval(checkMidnight, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [currentDate]);



  // 1. Show Splash Screen while checking auth
  if (authLoading) {
    return (
      <AnimatePresence>
        <SplashScreen />
      </AnimatePresence>
    );
  }

  // 2. Show Auth Page directly if no user
  if (!user) {
    return <AuthPage initialMode="signin" />;
  }

  // 3. Show Loading if data is loading (but user is authed)
  if (data.loading) {
    return (
      <Layout currentView={view} onNavigate={setView} currentDate={currentDate}>
        <Loading />
      </Layout>
    );
  }

  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const handleMonthSelect = (date: Date) => {
    setCurrentDate(date);
    setView('dashboard'); // Switch to dashboard to see that month
  };

  const isCurrentYear = new Date().getFullYear() === currentYear && new Date().getMonth() === currentDate.getMonth();

  // Day Count Logic (Still needed for header display)
  const daysInMonth = getDaysInMonth(currentDate);
  const todayDate = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
  const isRealCurrentYear = new Date().getFullYear() === currentYear;


  // Progress Calculations
  const calculateProgress = () => {
    const habits = data?.habits || [];
    const currentMonthStr = format(currentDate, 'yyyy-MM');
    // Filter habits: active if they are global OR match the current month
    const activeHabits = habits.filter(h => !h.month || h.month === currentMonthStr);

    if (activeHabits.length === 0) return { monthly: 0, yearly: 0 };

    // Monthly Progress
    let monthlyCompleted = 0;
    const totalPossibleMonthly = activeHabits.length * daysInMonth;

    // Yearly Progress
    let yearlyCompleted = 0;
    const daysElapsedInYear = isRealCurrentYear
      ? differenceInCalendarDays(new Date(), startOfYear(currentDate)) + 1
      : differenceInCalendarDays(endOfYear(currentDate), startOfYear(currentDate)) + 1;
    const totalPossibleYearly = habits.length * daysElapsedInYear;

    // Calculate Monthly Completions (using activeHabits)
    activeHabits.forEach(habit => {
      habit.completedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentYear) {
          const isFuture = isCurrentMonth && date.getDate() > todayDate;
          if (!isFuture) {
            monthlyCompleted++;
          }
        }
      });
    });

    // Calculate Yearly Completions (using ALL habits)
    habits.forEach(habit => {
      habit.completedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        if (date.getFullYear() === currentYear) {
          const isFuture = isRealCurrentYear && date > new Date();
          if (!isFuture) {
            yearlyCompleted++;
          }
        }
      });
    });

    return {
      monthly: totalPossibleMonthly > 0 ? Math.min(100, Math.round((monthlyCompleted / totalPossibleMonthly) * 100)) : 0,
      yearly: totalPossibleYearly > 0 ? Math.min(100, Math.round((yearlyCompleted / totalPossibleYearly) * 100)) : 0
    };
  };

  const progress = calculateProgress();

  return (
    <Layout currentView={view} onNavigate={setView} currentDate={currentDate}>
      <AnimatePresence mode="wait">
        {view === 'dashboard' ? (
          <PageTransition key="dashboard" className="space-y-8 pb-10">
            <header className="flex flex-col gap-6 md:flex-row md:items-end justify-between border-b border-surfaceHighlight pb-6">
              <div className="space-y-4 flex-1">
                <div>
                  <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary pb-1">
                    {isCurrentYear ? 'Dashboard' : `${currentYear} Overview`}
                  </h1>
                  <p className="text-secondary text-lg mt-1">
                    {currentMonthName} {currentYear}
                  </p>
                </div>

                {!isCurrentYear && (
                  <button
                    onClick={() => handleMonthSelect(new Date())}
                    className="text-xs px-3 py-1.5 bg-accent/10 text-accent font-medium rounded-full hover:bg-accent/20 transition-all hover:pr-4 group flex items-center gap-1"
                  >
                    <span className="opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300">←</span>
                    Back to Today
                  </button>
                )}

                <div className="flex gap-8 max-w-xs">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-xs font-medium text-secondary uppercase tracking-wider">
                      <span>Monthly Progress</span>
                      <span className="text-primary">{progress.monthly}%</span>
                    </div>
                    <div className="h-2 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-1000 ease-out rounded-full"
                        style={{ 
                            width: `${progress.monthly}%`,
                            background: `linear-gradient(to right, rgb(var(--accent)), #8338EC)`,
                            boxShadow: `0 0 10px rgb(var(--accent) / 0.3)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="px-3 py-2 bg-surface rounded-xl border border-surfaceHighlight text-center">
                  <span className="block text-lg font-bold text-primary font-mono">
                    {isCurrentMonth ? `${todayDate} / ${daysInMonth}` : daysInMonth}
                  </span>
                  <span className="text-[10px] text-secondary font-medium uppercase tracking-wider">
                    {isCurrentMonth ? 'Day' : 'Total Days'}
                  </span>
                </div>
              </div>
            </header>

            {/* Section 1: Protocols (Habits) */}
            <section>
              <div className="bg-surface border border-primary/5 rounded-3xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <HabitGrid date={currentDate} key={`habit-grid-${currentDate.toISOString()}`} />
              </div>
            </section>

            {/* Section 1.5: Mood & Energy (New) */}
            <section>
              <div className="bg-surface border border-primary/5 rounded-3xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <MoodSelector date={currentDate} />
              </div>
            </section>

            {/* Section 2: Achievements & ToDo */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-surface border border-primary/5 rounded-3xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] h-full min-h-[400px]">
                <AchievementBoard date={currentDate} key={`achievements-${currentDate.toISOString()}`} />
              </div>
              <div className="bg-surface border border-primary/5 rounded-3xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] h-full min-h-[400px]">
                <TodoBoard />
              </div>
            </section>

            {/* Section 3: Metrics */}
            <section>
              <div className="bg-surface border border-primary/5 rounded-3xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <MetricGraph date={currentDate} key={currentDate.toISOString()} />
              </div>
            </section>
          </PageTransition>
        ) : view === 'journal' ? (
          <PageTransition key="journal">
            <JournalEditor />
          </PageTransition>
        ) : view === 'year' ? (
          <PageTransition key="year">
            <YearView onSelectMonth={handleMonthSelect} />
          </PageTransition>
        ) : view === 'settings' ? (
          <PageTransition key="settings">
            <SettingsView onBack={() => setView('dashboard')} />
          </PageTransition>
        ) : null}
      </AnimatePresence>
    </Layout>
  );
}

export default App;
