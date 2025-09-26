# Retinal Delights NFT Marketplace

A Webflow Designer Extension for displaying and managing NFT collections with thirdweb integration. This project provides a simple NFT marketplace interface that can be embedded directly into Webflow sites.

## 🚀 Features

- **NFT Collection Display** - Show your NFT collection with metadata and images
- **Wallet Connection** - Connect user wallets using thirdweb
- **Webflow Integration** - Embed directly into Webflow sites via Designer Extension
- **thirdweb v5** - Modern Web3 SDK for blockchain interactions
- **TypeScript** - Full type safety throughout the application

## 🛠️ Tech Stack

- **Designer Extension:**
  - **[Webflow Designer API](https://www.npmjs.com/package/@webflow/designer-extension-typings)** - Official Webflow Designer API client
  - **[Vite](https://vitejs.dev/)** - Build tool for modern web development
  - **[React](https://reactjs.org/)** - JavaScript library for building user interfaces
  - **[thirdweb v5](https://thirdweb.com/)** - Web3 SDK for blockchain interactions
  - **[TypeScript](https://www.typescriptlang.org/)** - Type safety and developer experience

## 🚀 Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Install Webflow CLI:**
   ```bash
   npm install -g @webflow/cli
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the `designer-extension` directory:
   ```env
   THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here
   ```

4. **Start Development:**
   ```bash
   npm run dev
   ```

5. **Bundle for Webflow:**
   ```bash
   cd designer-extension
   webflow extension bundle
   ```

6. **Upload to Webflow:**
   - Go to your Webflow app dashboard
   - Upload the generated zip file
   - Install the extension in your Webflow site

## 📁 Project Structure

```
.
├── designer-extension/              # Main Designer Extension app
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── hooks/                  # Custom hooks
│   │   ├── services/               # API services/logic
│   │   ├── types/                  # TypeScript types
│   │   └── App.tsx                 # Main app component
│   ├── webflow.json               # Webflow extension config
│   └── package.json
├── docs/                          # NFT metadata and URLs
│   ├── combined_metadata.json     # NFT metadata
│   └── nft_urls.json             # NFT image URLs
├── .cursor/                       # Cursor AI configuration
│   └── mcp.json                   # thirdweb MCP setup
└── package.json                   # Root package.json
```

## 🎯 NFT Collection Setup

Your NFT collection data is stored in the `docs/` directory:
- `combined_metadata.json` - Contains all NFT metadata
- `nft_urls.json` - Contains IPFS URLs for NFT images

The extension will automatically load and display this data.

## 🔧 Configuration

### thirdweb Setup
1. Get your Client ID from [thirdweb dashboard](https://thirdweb.com/dashboard)
2. Add it to your `.env.local` file
3. Configure MCP in `.cursor/mcp.json` for AI assistance

### Webflow Setup
1. Create a Webflow app in your workspace
2. Set up the Designer Extension
3. Upload the bundled zip file
4. Install in your Webflow site

## 📚 Resources

- [Webflow Designer Extensions](https://developers.webflow.com/designer/docs/getting-started-designer-extensions)
- [thirdweb Documentation](https://portal.thirdweb.com/)
- [thirdweb MCP Server](https://github.com/thirdweb-dev/mcp-server)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is MIT licensed.