"use client";

import { WalletOverview } from '@/components/WalletOverview';
import { PortfolioChart } from '@/components/PortfolioChart';
import { AssetAllocation } from '@/components/AssetAllocation';
import { AdvisorSelection } from '@/components/AdvisorSelection';
import { ConnectWallet } from '@/components/ConnectWallet';
import { FloatingAdvisorChat } from '@/components/FloatingAdvisorChat';
import { MemeMarquee } from '@/components/MemeMarquee';
import { EnhancedDeFiRecommendations } from '@/components/EnhancedDeFiRecommendations';
import { useState } from 'react';
import { PoolTable } from '@/components/PoolTable';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/I18nContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MagicCard } from '@/components/ui/magic-card';

const AVAILABLE_ADVISORS = [
  "conservative",
  "growth",
  "quantitative",
  "meme"
] as const;

type AdvisorType = typeof AVAILABLE_ADVISORS[number];

interface ChatWindow {
  advisorType: AdvisorType;
  isVisible: boolean;
  messages: Message[];
}

export default function Home() {
  const [chatWindows, setChatWindows] = useState<Record<string, ChatWindow>>({});
  const [currentAssets, setCurrentAssets] = useState<TokenBalance[]>([]);
  const { t } = useI18n();
  const handleAdvisorSelect = (advisorType: AdvisorType) => {
    console.log('Home: handleAdvisorSelect called with:', advisorType);
    console.log('Current chatWindows:', chatWindows);

    setChatWindows(prev => {
      const newWindows = { ...prev };
      console.log('Processing windows:', newWindows);

      // 隐藏其他顾问的窗口
      Object.keys(newWindows).forEach(key => {
        newWindows[key].isVisible = key === advisorType;
      });

      // 如果该顾问窗口不存在，创建新窗口
      if (!newWindows[advisorType]) {
        console.log('Creating new window for:', advisorType);
        newWindows[advisorType] = {
          advisorType,
          isVisible: true,
          messages: []
        };
      } else {
        console.log('Showing existing window for:', advisorType);
        newWindows[advisorType].isVisible = true;
      }

      console.log('Final windows state:', newWindows);
      return newWindows;
    });
  };

  const handleCloseChat = (advisorType: AdvisorType) => {
    setChatWindows(prev => ({
      ...prev,
      [advisorType]: {
        ...prev[advisorType],
        isVisible: false
      }
    }));
  };

  const handleUpdateMessages = (advisorType: AdvisorType, messages: Message[]) => {
    setChatWindows(prev => ({
      ...prev,
      [advisorType]: {
        ...prev[advisorType],
        messages
      }
    }));
  };

  console.log('Home: Rendering with chatWindows:', chatWindows);

  return (
    <main className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Linea WalletMate 🐸</h1>
            <p className="text-muted-foreground">Your AI-Powered DeFi Companion on Linea</p>
          </div>
          <ConnectWallet />
        </div>
        <MagicCard
          className="shadow-2xl p-6 block"
          gradientColor={"#D9D9D955"}
        >
          <h1 className="text-2xl font-semibold mb-6">{t("asset.title")}</h1>
          <Tabs defaultValue="overview" className="w-full my-2">
            <TabsList>
              <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
              <TabsTrigger value="history">Account History</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid gap-6 md:grid-cols-2 pb-5">
                <WalletOverview />
                <AssetAllocation onAssetsUpdate={setCurrentAssets} />
              </div>
            </TabsContent>
            <TabsContent value="history">
              <PortfolioChart />
            </TabsContent>
          </Tabs>
        </MagicCard>

        <MagicCard
          className="shadow-2xl p-6 block"
          gradientColor={"#D9D9D955"}
        >
          <h1 className="text-2xl font-semibold mb-6">{t("investment.title")}</h1>
          <div className="grid gap-6 md:grid-cols-2 pb-5 grid-rows-[minmax(100px, 600px)]">
            <PoolTable />
            <MemeMarquee />

          </div>
        </MagicCard>
        <MagicCard
          className="shadow-2xl p-6 block"
          gradientColor={"#D9D9D955"}
        >
          <h1 className="text-2xl font-semibold mb-6">{t("ai.title")}</h1>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <AdvisorSelection onAdvisorSelect={handleAdvisorSelect} />
            </div>
            <EnhancedDeFiRecommendations />
          </div>
        </MagicCard>


        {Object.entries(chatWindows).map(([type, window]) => (
          window.isVisible && (
            <FloatingAdvisorChat
              key={type}
              advisorType={type}
              assets={currentAssets}
              messages={window.messages}
              onMessagesUpdate={(messages) => handleUpdateMessages(type, messages)}
              onClose={() => handleCloseChat(type)}
            />
          )
        ))}
      </div>
    </main>
  );
}