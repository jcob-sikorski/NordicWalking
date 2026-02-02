import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Global styles (likely including Tailwind if you're using it)
import App from './App.jsx' // The main logic container you just shared

/**
 * 1. Find the 'root' div in your index.html.
 * 2. Initialize the React rendering engine on that element.
 */
createRoot(document.getElementById('root')).render(
  /**
   * <StrictMode> is a development-only wrapper.
   * It intentionally double-invokes your components (calls them twice) to help you:
   * - Find side effects that aren't cleaned up.
   * - Identify deprecated API usage.
   * - Spot bugs in your rendering logic before they hit production.
   */
  <StrictMode>
    {/* This log will appear twice in your console during development 
        because of StrictMode's double-rendering behavior! 
    */}
    {console.log("React App Mounting...")}
    
    {/* Start rendering the actual application */}
    <App />
  </StrictMode>,
)