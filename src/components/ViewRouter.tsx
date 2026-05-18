/**
 * View Router Component
 * 
 * Handles conditional rendering of views based on current navigation state.
 * Applies fade in/out transition animations between view changes.
 * Gracefully handles unknown view types by defaulting to landing view.
 * 
 */

import React from 'react';
import type { ViewType } from '../types/game';

// Import all views
import Landing from '../views/Landing';
import Game from '../views/Game';
import Stats from '../views/Stats';
import Leaderboard from '../views/Leaderboard';
import Settings from '../views/Settings';

/**
 * ViewRouter Props
 */
interface ViewRouterProps {
  /** Current view to render */
  currentView: ViewType;
}

/**
 * ViewRouter Component
 * 
 * Conditionally renders the appropriate view component based on currentView prop.
 * Applies CSS fade transition animations for smooth view changes.
 * 
 * @param props - Component props
 * @returns The appropriate view component wrapped in a transition container
 */
const ViewRouter: React.FC<ViewRouterProps> = ({ currentView }) => {
  /**
   * Render the appropriate view based on currentView
   * Defaults to Landing view if currentView is unknown
   */
  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <Landing />;
      
      case 'game':
        return <Game />;
      
      case 'stats':
        return <Stats />;
      
      case 'leaderboard':
        return <Leaderboard />;
      
      case 'settings':
        return <Settings />;
      
      default:
        // Handle unknown view types gracefully by defaulting to landing
        console.warn(`Unknown view type: ${currentView}. Defaulting to landing view.`);
        return <Landing />;
    }
  };

  return (
    <div
      className="view-container animate-fadeIn"
      key={currentView}
      role="main"
      aria-live="polite"
    >
      {renderView()}
    </div>
  );
};

export default ViewRouter;
