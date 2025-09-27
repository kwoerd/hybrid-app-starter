import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, Box } from "@mui/material";

import { Navigation } from "./components/Navigation";
import { CustomCodeDashboard } from "./components/CustomCode/CustomCodeDashboard";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import { DevTools } from "./components/DevTools";
import { useAuth } from "./hooks/useAuth"; // Manages authentication state and provides login/logout functionality
import { useSites } from "./hooks/useSites"; // Fetches and manages site data using the session token
import { theme } from "./components/theme";
import "./App.css";
import { ElementsDashboard } from "./components/Elements/ElementsDashboard";

// Import NFT Marketplace components
import { NFTMarketplace } from "./components/marketplace/NFTMarketplace";
import { TestMarketplace } from "./components/TestMarketplace";
import { loadNFTData, NFTData } from "./lib/nftDataLoader";

/**
 * App.tsx serves as the main entry point and demonstrates:
 * 1. Authentication flow with Webflow's Designer and Data APIs
 * 2. Data fetching patterns using React Query
 * 3. State management for user sessions
 * 4. Development tools for testing
 *
 * The code is intentionally verbose to show common patterns
 * you might need when building your own Webflow App.
 */

// This is the main App Component. It handles the initial setup and rendering of the Dashboard.
function AppContent() {
  const [hasClickedFetch, setHasClickedFetch] = useState(false);
  const [nftData, setNftData] = useState<{ nfts: NFTData[]; isLoading: boolean; error?: string }>({
    nfts: [],
    isLoading: true,
  });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user, sessionToken, exchangeAndVerifyIdToken, logout } = useAuth();
  const { sites, isLoading, isError, error, fetchSites } = useSites(
    sessionToken,
    hasClickedFetch
  );

  // Move ref outside useEffect to persist across renders
  const hasCheckedToken = useRef(false);

  // Load NFT data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadNFTData();
        setNftData(data);
      } catch (error) {
        console.error('Failed to load NFT data:', error);
        setNftData({
          nfts: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load NFT data'
        });
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Set the extension size to large
    webflow.setExtensionSize("large");

    // Only run auth flow if not already checked
    if (!hasCheckedToken.current) {
      const storedUser = localStorage.getItem("wf_hybrid_user");
      const wasExplicitlyLoggedOut = localStorage.getItem(
        "explicitly_logged_out"
      );

      if (storedUser && !wasExplicitlyLoggedOut) {
        exchangeAndVerifyIdToken();
      }
      hasCheckedToken.current = true;
    }

    // Handle the authentication complete event
    const handleAuthComplete = async (event: MessageEvent) => {
      if (event.data === "authComplete") {
        localStorage.removeItem("explicitly_logged_out");
        await exchangeAndVerifyIdToken();
      }
    };

    // Add the event listener for the authentication complete event
    window.addEventListener("message", handleAuthComplete);
    return () => {
      window.removeEventListener("message", handleAuthComplete);
      // Reset the check on unmount so it can run again if needed
      hasCheckedToken.current = false;
    };
  }, [exchangeAndVerifyIdToken]);

  // Handle the fetch sites button click
  const handleFetchSites = () => {
    setHasClickedFetch(true);
    fetchSites();
  };

  // NFT Marketplace handlers
  const handleBid = async (nft: NFTData, bidAmount: string) => {
    console.log('Bid placed:', { nft: nft.name, bidAmount });
    // TODO: Implement actual bidding logic with thirdweb
    alert(`Bid of ${bidAmount} ETH placed on ${nft.name}`);
  };

  const handleBuyNow = async (nft: NFTData) => {
    console.log('Buy now clicked:', nft.name);
    // TODO: Implement actual buy now logic with thirdweb
    alert(`Buy now clicked for ${nft.name}`);
  };

  const handleFavorite = (tokenId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tokenId)) {
        newFavorites.delete(tokenId);
      } else {
        newFavorites.add(tokenId);
      }
      return newFavorites;
    });
  };

  // Render the app
  return (
    <BrowserRouter>
      <Box sx={{ pb: 8 }}>
        <Navigation />
        <Routes>
          <Route
            path="/"
            element={
              // Show NFT Marketplace as the main interface
              <NFTMarketplace
                nfts={nftData.nfts}
                isLoading={nftData.isLoading}
                onBid={handleBid}
                onBuyNow={handleBuyNow}
                onFavorite={handleFavorite}
                favorites={favorites}
                className="p-6"
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              // If the user is authenticated, render the dashboard
              sessionToken ? (
                <Dashboard
                  user={user}
                  sites={sites}
                  isLoading={isLoading}
                  isError={isError}
                  error={error?.message || ""}
                  onFetchSites={handleFetchSites}
                />
              ) : (
                // If the user is not authenticated, render the auth screen
                <AuthScreen onAuth={() => {}} />
              )
            }
          />
          <Route path="/custom-code" element={<CustomCodeDashboard />} />
          <Route
            path="/elements"
            element={
              sessionToken ? (
                <ElementsDashboard />
              ) : (
                <AuthScreen onAuth={() => {}} />
              )
            }
          />
        </Routes>
      </Box>
      <DevTools logout={logout} setHasClickedFetch={setHasClickedFetch} />
    </BrowserRouter>
  );
}

function App() {
  // For development, show the test marketplace
  if (import.meta.env.DEV) {
    return <TestMarketplace />;
  }

  return (
    <ThemeProvider theme={theme}>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
