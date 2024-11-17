import { useNavigate } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";
import NetworkSphere from './NetworkSpheres';

function Landing() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <nav className="fixed w-full z-10 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-dark-bg">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-maya rounded-lg flex items-center justify-center text-white hover:bg-maya/90 transition-colors">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </div>
            <span className="text-xl font-medium text-jet dark:text-dark-text">Notable</span>
          </div>
          <div className="flex items-center gap-8">
            <button
              onClick={toggleDarkMode}
              className="text-jet/70 dark:text-dark-text/70 hover:text-maya dark:hover:text-maya"
            >
              {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-jet dark:text-dark-text hover:text-maya dark:hover:text-maya font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 pt-32">
        <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-16 items-center">
          <div className="space-y-16">
            <h1 className="text-[64px] leading-[1.1] font-medium tracking-tight text-jet dark:text-dark-text">
              AI <span className="text-maya">research</span> and{" "}
              <span className="text-maya">products</span> that put intelligence at the frontier
            </h1>

            <div className="grid gap-8">
              <div className="bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 dark:border-dark-surface">
                <div className="text-sm font-medium text-maya mb-2">NOTABLE</div>
                <h2 className="text-2xl font-medium text-jet dark:text-dark-text mb-3">
                  Meet Notable Assistant
                </h2>
                <p className="text-lg text-jet/70 dark:text-dark-text/70 mb-6">
                  Our most intelligent AI note-taking assistant is now available.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-3 bg-jet dark:bg-maya text-white rounded-lg hover:opacity-90 transition-all"
                >
                  Try Notable
                </button>
              </div>

              <div className="bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 dark:border-dark-surface">
                <div className="text-sm font-medium text-maya mb-2">API</div>
                <h2 className="text-2xl font-medium text-jet dark:text-dark-text mb-3">
                  Build with Notable
                </h2>
                <p className="text-lg text-jet/70 dark:text-dark-text/70 mb-6">
                  Start using Notable to drive efficiency and create new revenue streams.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-3 border border-jet dark:border-maya text-jet dark:text-maya rounded-lg hover:bg-jet/5 dark:hover:bg-maya/5 transition-all"
                >
                  Learn more
                </button>
              </div>
            </div>
          </div>

          <div className="relative aspect-square">
            <div className="absolute inset-0 bg-gradient-to-br from-maya/20 to-pink/20 rounded-full blur-3xl" />
            <div className="relative z-10 w-full h-full">
              <NetworkSphere />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Landing;
