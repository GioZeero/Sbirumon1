import * as React from "react"

// This hook is no longer used as the layout is now fixed.
// It is kept for potential future use if responsiveness is re-introduced.

const MOBILE_BREAKPOINT = 768; 

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkDevice = () => {
      // Check for touch support first, as it's a strong indicator of mobile
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      // Also check window width as a fallback
      const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
      
      setIsMobile(hasTouch || isSmallScreen);
    };

    // Initial check
    checkDevice();
    
    // Listen for resize events
    window.addEventListener("resize", checkDevice);

    // Cleanup
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return false; // Always return false for a fixed layout
}
