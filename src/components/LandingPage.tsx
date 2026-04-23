
import { Logo } from './ui/Logo';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function LandingPage({ onSignIn, onSignUp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background text-primary font-sans relative overflow-hidden flex flex-col">
      {/* Curved Background Text & Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        <svg
          viewBox="0 0 1440 800"
          className="absolute w-full h-full min-w-[1200px] opacity-80"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            id="curve"
            d="M -200 600 C 200 800, 600 200, 1000 600 C 1400 1000, 1800 400, 2200 600"
            fill="transparent"
            stroke="transparent"
          />
          <text className="text-xl md:text-2xl font-medium tracking-widest text-primary/80 uppercase">
            <textPath href="#curve" startOffset="0%">
              my habits are off to a good start. I was looking at my goals earlier, and the progress was really great and I think I am going to handle the first part of the project...
            </textPath>
          </text>
        </svg>

        {/* Decorative elements representing the 'recording' pill */}
        <div className="absolute bottom-[20%] right-[30%] md:right-[40%] bg-surface border-2 border-primary rounded-full px-4 py-2 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] rotate-[-10deg] animate-pulse">
           <div className="flex items-end gap-1 h-4">
              <div className="w-1 h-3 bg-primary rounded-full"></div>
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              <div className="w-1 h-2 bg-primary rounded-full"></div>
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              <div className="w-1 h-3 bg-primary rounded-full"></div>
           </div>
        </div>

        {/* Decorative Circle Bottom Left */}
        <div className="absolute bottom-12 left-12 w-16 h-16 bg-accent border border-primary/20 rounded-full flex items-center justify-center shadow-lg">
           <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
             <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
           </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-surfaceHighlight/50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Logo className="h-6" />
            <span className="font-bold text-xl tracking-tight">Ituts</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-primary/80">
            <button className="hover:text-primary transition-colors flex items-center gap-1">Product <span className="text-[10px]">▼</span></button>
            <button className="hover:text-primary transition-colors flex items-center gap-1">Individuals <span className="text-[10px]">▼</span></button>
            <button className="hover:text-primary transition-colors">Business</button>
            <button className="hover:text-primary transition-colors flex items-center gap-1">Resources <span className="text-[10px]">▼</span></button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onSignIn}
            className="hidden md:block px-4 py-2 text-sm font-bold border-2 border-primary rounded-lg hover:bg-primary/5 transition-colors shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(17,17,17,1)]"
          >
            Sign In
          </button>
          <button 
            onClick={onSignUp}
            className="px-4 py-2 text-sm font-bold bg-accent border-2 border-primary rounded-lg hover:bg-accent/90 transition-colors shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(17,17,17,1)]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 -mt-20">
        <h1 className="text-6xl md:text-8xl lg:text-[100px] font-serif font-medium tracking-tight text-primary max-w-5xl leading-[1.1] mb-8">
          Don't drift, just <span className="italic">track</span>
        </h1>
        
        <p className="text-lg md:text-xl font-medium text-secondary max-w-2xl mb-12">
          The high-performance journal that turns your daily habits into clear, measurable progress.
        </p>

        <button 
          onClick={onSignUp}
          className="btn-premium flex items-center gap-3 text-lg px-8 py-4 bg-accent"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
             <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
          Get Started
        </button>

        <p className="mt-8 text-sm font-medium text-secondary/60">
          Available on Web, Desktop, and Mobile
        </p>
      </main>
    </div>
  );
}
