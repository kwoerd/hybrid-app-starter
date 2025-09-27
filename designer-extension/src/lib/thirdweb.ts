import { createThirdwebClient } from "thirdweb";
import { base, ethereum } from "thirdweb/chains";

// 1) Load your env values (use placeholders only in dev)
const isDev = import.meta.env.DEV;

export const THIRDWEB_CLIENT_ID = "b324cc92df893b02f19b419feee3f254";

// 2) In prod, fail fast if they're missing
if (!isDev && !THIRDWEB_CLIENT_ID) {
  throw new Error(
    "❌ Missing required Thirdweb env var: VITE_THIRDWEB_CLIENT_ID"
  );
}

// 3) Initialize Thirdweb client
export const client = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID!,
});

// 4) Supported chains with proper configuration
export const supportedChains = [base, ethereum];

// 5) Your contract addresses (pulled from env or hard-coded fallbacks)
export const NFT_CONTRACT_ADDRESS =
  import.meta.env.VITE_NFT_COLLECTION_ADDRESS || "0xE3f1694adCe46ffcF82D15dd88859147c72f7C5a";

export const MARKETPLACE_CONTRACT_ADDRESS =
  import.meta.env.VITE_MARKETPLACE_ADDRESS || "0xF0f26455b9869d4A788191f6AEdc78410731072C";

// Export the base chain for use in components
export { base };
