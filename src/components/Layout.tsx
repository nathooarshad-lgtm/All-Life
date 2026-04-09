import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { seasonThemes } from '../modules/ui';
import { seasonAudio } from '../utils/seasonAudio';

const sections = [
  { path: '/dashboard', label: 'Dashboard', icon: 'Trail' },
  { path: '/nutrition', label: 'Nutrition', icon: 'Harvest' },
  { path: '/hydration', label: 'Hydration', icon: 'River' },
  { path: '/fitness', label: 'Fitness', icon: 'Motion' },
  { path: '/bodystats', label: 'Body Stats', icon: 'Balance' },
  { path: '/sleep', label: 'Sleep', icon: 'Moon' },
  { path: '/mood', label: 'Mood', icon: 'Mindset' },
  { path: '/tasks', label: 'Tasks', icon: 'Path' },
  { path: '/coach', label: 'Coach', icon: 'Guide' },
  { path: '/settings', label: 'Settings', icon: 'Control' },
  { path: '/about', label: 'About', icon: 'Story' },
];

const seasonOrder = ['spring', 'summer', 'autumn', 'winter'] as const;
const AUTO_SEASON_MIN_INTERVAL_MS = 5 * 60 * 1000;
const AUTO_SEASON_LAST_SWITCH_KEY = 'all_life_last_season_switch_at';

const specialBackgrounds = {
  'nature-back-1': '/backgrounds/nature-back-1.png',
  'nature-back-2': '/backgrounds/nature-back-2.png',
  'ai-meadow': '/backgrounds/all-back.jpg',
  'ai-misty': '/backgrounds/autumn-back.jpg',
  'ai-summit': '/backgrounds/winter-back.jpg'
} as const;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { state, dispatch } = useApp();
  const activeSeason = seasonThemes[state.season];
  const isWelcomeRoute = location.pathname === '/welcome';
  
  const getBackgroundImage = () => {
    if (state.backgroundChoice === 'custom' && state.customBackgroundUrl) {
      return state.customBackgroundUrl;
    }
    if (state.backgroundChoice === 'seasonal') return activeSeason.heroImage;
    if (state.backgroundChoice in specialBackgrounds) {
      return specialBackgrounds[state.backgroundChoice as keyof typeof specialBackgrounds];
    }
    return activeSeason.heroImage;
  };
  const currentBackground = getBackgroundImage();

  React.useEffect(() => {
    seasonAudio.play(state.season, state.ambientSoundEnabled);
    return () => seasonAudio.stop();
  }, [state.season, state.ambientSoundEnabled]);

  React.useEffect(() => {
    if (!state.autoSeasonCycle) return;

    const tryAdvanceSeason = () => {
      const now = Date.now();
      const lastSwitchAt = Number(localStorage.getItem(AUTO_SEASON_LAST_SWITCH_KEY) || 0);
      if (now - lastSwitchAt < AUTO_SEASON_MIN_INTERVAL_MS) return;

      const currentIndex = seasonOrder.indexOf(state.season);
      const nextSeason = seasonOrder[(currentIndex + 1) % seasonOrder.length];
      localStorage.setItem(AUTO_SEASON_LAST_SWITCH_KEY, String(now));
      dispatch({ type: 'SET_SEASON', payload: nextSeason });
    };

    // Check often enough; actual switch is gated to once per 5 minutes.
    const interval = window.setInterval(tryAdvanceSeason, 60 * 1000);
    tryAdvanceSeason();

    return () => window.clearInterval(interval);
  }, [state.autoSeasonCycle, state.season, dispatch]);

  const handleShellAction = (event: React.MouseEvent<HTMLElement>) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    if (action === 'set-season') {
      const season = trigger.dataset.season as typeof state.season | undefined;
      if (season) dispatch({ type: 'SET_SEASON', payload: season });
    }
    if (action === 'toggle-ambient') {
      dispatch({ type: 'TOGGLE_AMBIENT_SOUND' });
    }
  };

  return (
    <div 
      className={`nature-shell min-h-screen bg-cover bg-center bg-no-repeat season-${state.season} ui-theme-${state.uiTheme} ui-mode-${state.colorMode}${isWelcomeRoute ? ' welcome-shell' : ''}`} 
      onClick={handleShellAction}
      style={{ backgroundImage: currentBackground ? `url(${currentBackground})` : undefined }}
    >
      {!isWelcomeRoute && <aside className="nature-sidebar-shell nature-sidebar nature-panel hidden md:flex flex-col">
        <div className="nature-hud-head nature-card p-4 mb-4">
          <p className="nature-rank-label">Nature Rank</p>
          <h1 className="brand-title">All Life</h1>
          <p className="season-description">{activeSeason.title}</p>
        </div>

        <nav className="nature-nav-list flex-1">
          {sections.map(section => (
            <Link
              key={section.path}
              to={section.path}
              className={`nature-nav-btn ${
                location.pathname === section.path
                  ? 'nature-link active'
                  : 'nature-link'
              }`}
            >
              <span className="nature-nav-icon">{section.icon}</span>
              <span>{section.label}</span>
            </Link>
          ))}
        </nav>


      </aside>}

      <div className="nature-content-wrap">
        {!isWelcomeRoute && <header className="nature-topbar nature-card p-4 mb-4">
          <div>
            <p className="nature-rank-label">Current Season</p>
            <h2>{seasonThemes[state.season].label}</h2>
          </div>
          <div className="nature-topbar-meta">Ambient: {state.ambientSoundEnabled ? 'On' : 'Off'}</div>
        </header>}

        {!isWelcomeRoute && <div className="nature-tabs-shell nature-card p-2 mb-4 hidden md:flex">
          <nav className="nature-tab-rail">
            {sections.map(section => (
              <Link
                key={`tab-${section.path}`}
                to={section.path}
                className={`nature-tab ${location.pathname === section.path ? 'active' : ''}`}
              >
                <span className="nature-nav-icon">{section.icon}</span>
                <span>{section.label}</span>
              </Link>
            ))}
          </nav>
        </div>}

        {/* Main Content */}
        <main className="nature-main overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {!isWelcomeRoute && <footer className="nature-footer">All Life Nature Edition | By: Mr Nathoo</footer>}
      </div>

      {/* Mobile Bottom Nav */}
      {!isWelcomeRoute && <nav className="nature-mobile-dock md:hidden">
        {sections.map(section => (
          <Link
            key={section.path}
            to={section.path}
            className={`nature-mobile-btn ${
              location.pathname === section.path
                ? 'nature-link active'
                : 'nature-link'
            }`}
          >
            <span className="nature-nav-icon">{section.icon}</span>
            <span className="text-xs">{section.label}</span>
          </Link>
        ))}
      </nav>}
    </div>
  );
};

export default Layout;