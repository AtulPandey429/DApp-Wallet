import { createContext, useContext } from 'react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createStorage, cookieStorage, WagmiProvider } from 'wagmi';
import { createAppKit, useAppKitProvider } from '@reown/appkit/react';
import { base } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = '3ae7de7f2595ee410fa4f3b9e29e2944';

const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: false,
  networks: [base],
  projectId,
});

const queryClient = new QueryClient();

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: wagmiAdapter.wagmiConfig.chains,
  defaultNetwork: base,
  projectId,
  features: { allWallets: true, email: false, socials: false },
  ui: {
    themeMode: 'dark', // or 'light', or 'auto'
    themeVariables: {
      '--appkit-background-color': '#1a1a1a',
      '--appkit-text-color': '#ffffff',
      // You can tweak more colors here if needed
    }
  }
});

const AppKitContext = createContext({ modal });

// Export custom AppKit context
export const useAppKit = () => useContext(AppKitContext);

// ✅ Export Reown's provider hook for wallet access (e.g. use with BrowserProvider)
export { useAppKitProvider };

export function AppKitProvider({ children }) {
  return (
    <AppKitContext.Provider value={{ modal }}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </AppKitContext.Provider>
  );
}
