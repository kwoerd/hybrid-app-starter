import React from 'react';
import { ConnectButton } from 'thirdweb/react';
import { darkTheme } from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';
import { client } from '../../lib/thirdweb';

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("walletConnect"),
];

export interface ConnectWalletProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  const variantClasses = {
    default: 'bg-brand-pink hover:bg-brand-pink-hover text-text-primary border-brand-pink',
    outline: 'bg-transparent hover:bg-bg-secondary text-text-primary border-border-primary hover:border-border-secondary',
    ghost: 'bg-transparent hover:bg-bg-secondary text-text-secondary hover:text-text-primary border-transparent'
  };

  return (
    <div className={className}>
      <ConnectButton
        client={client}
        connectButton={{ 
          label: "CONNECT",
          className: `!rounded-button !font-semibold !uppercase !tracking-wide !transition-all !duration-200 !ease-out !focus:outline-none !focus:ring-2 !focus:ring-offset-2 !disabled:opacity-50 !disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]}`
        }}
        connectModal={{
          privacyPolicyUrl: "https://retinaldelights.io/privacy",
          size: "compact",
          termsOfServiceUrl: "https://retinaldelights.io/terms",
        }}
        auth={{
          async doLogin(params) {
            // Custom login logic if needed
          },
          
          async doLogout() {
            // Custom logout logic if needed
          },
          
          async getLoginPayload(params) {
            const now = new Date();
            const issuedAt = now.toISOString();
            const expirationTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            const invalidBefore = now.toISOString();
            
            return {
              address: params.address,
              statement: `Welcome to Satoshe Sluggers Marketplace! Please sign this message to verify your wallet ownership.`,
              issued_at: issuedAt,
              expiration_time: expirationTime,
              invalid_before: invalidBefore,
              domain: "retinaldelights.io",
              version: "1",
              nonce: Math.random().toString(36).substring(2, 15),
            };
          },
          
          async isLoggedIn() {
            return true; // Thirdweb handles this automatically
          },
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
    </div>
  );
};

export default ConnectWallet;
