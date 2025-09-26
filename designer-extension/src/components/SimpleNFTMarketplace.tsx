import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ThirdwebProvider } from "thirdweb/react";
import { ConnectButton } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";

// Your existing wallet setup (NEVER ALTERED)
const client = createThirdwebClient({
  clientId: "b324cc92df893b02f19b419feee3f254",
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("walletConnect"),
];

// Simple marketplace component
const SimpleNFTMarketplace: React.FC = () => {
  const handleViewCollection = () => {
    window.open('https://satoshesluggers.com', '_blank');
  };

  return (
    <ThirdwebProvider clientId="b324cc92df893b02f19b419feee3f254" activeChain="base">
      <Box sx={{ p: 3, textAlign: 'center' }}>
        {/* Header */}
        <Typography variant="h3" component="h1" gutterBottom>
          Satoshe Sluggers Collection
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Women's Baseball Card NFTs by Retinal Delights
        </Typography>
        
        {/* Your Connect Button (NEVER ALTERED) */}
        <Box sx={{ mb: 4 }}>
          <ConnectButton
            client={client}
            connectButton={{ label: "CONNECT" }}
            connectModal={{
              privacyPolicyUrl: "https://retinaldelights.io/privacy",
              size: "compact",
              termsOfServiceUrl: "https://retinaldelights.io/terms",
            }}
            theme={darkTheme({
              colors: {
                accentText: "hsl(324, 100%, 50%)",
                accentButtonBg: "hsl(324, 100%, 50%)",
                primaryButtonBg: "hsl(324, 100%, 50%)",
                primaryButtonText: "hsl(0, 0%, 100%)",
                modalBg: "hsl(0, 0%, 9%)",
                borderColor: "hsl(0, 0%, 40%)",
                separatorLine: "hsl(0, 0%, 14%)",
                tertiaryBg: "hsl(0, 0%, 7%)",
                skeletonBg: "hsl(0, 0%, 13%)",
                secondaryButtonBg: "hsl(0, 0%, 13%)",
                secondaryIconHoverBg: "hsl(0, 0%, 9%)",
                tooltipText: "hsl(0, 0%, 9%)",
                inputAutofillBg: "hsl(0, 0%, 9%)",
                scrollbarBg: "hsl(0, 0%, 9%)",
                secondaryIconColor: "hsl(0, 0%, 40%)",
                connectedButtonBg: "hsl(0, 0%, 9%)",
                connectedButtonBgHover: "hsl(0, 0%, 2%)",
                secondaryButtonHoverBg: "hsl(0, 0%, 9%)",
                selectedTextColor: "hsl(0, 0%, 9%)",
                secondaryText: "hsl(0, 0%, 82%)",
                primaryText: "hsl(0, 0%, 100%)",
              },
            })}
            wallets={wallets}
          />
        </Box>

        {/* Collection Link */}
        <Button 
          variant="contained" 
          size="large"
          onClick={handleViewCollection}
          sx={{
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)',
            },
          }}
        >
          View Collection at satoshesluggers.com
        </Button>
      </Box>
    </ThirdwebProvider>
  );
};

export default SimpleNFTMarketplace;
