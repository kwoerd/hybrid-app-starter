import React, { useEffect } from "react";
import { ThemeProvider } from "./components/theme-provider";
import NFTsPage from "./components/TestMarketplace";

function App() {
  useEffect(() => {
    // Suppress Webflow extension errors in development
    if (import.meta.env.DEV) {
      const originalError = console.error;
      console.error = (...args) => {
        if (args[0]?.includes?.('You must be running within Webflow')) {
          return; // Suppress this specific error
        }
        originalError.apply(console, args);
      };
    }
  }, []);

  // For development, show the NFT marketplace
  if (import.meta.env.DEV) {
    return <NFTsPage />;
  }

  return (
    <ThemeProvider>
      <div>
        {/* Webflow extension content */}
      </div>
    </ThemeProvider>
  );
}

export default App;
