"use client";

import { Card } from "@/components/ui/card";
import { Shield, TrendingUp, Binary, Sparkles, Loader2 } from "lucide-react";
import { useEthersContract } from "@/hooks/useEthersContract";
import { Button } from "@/components/ui/button";
import { AdvisorType } from "@/types/advisor";
import { useI18n } from '@/lib/i18n/I18nContext';

interface AdvisorSelectionProps {
  onAdvisorSelect: (advisorType: AdvisorType) => void;
}

export function AdvisorSelection({ onAdvisorSelect }: AdvisorSelectionProps) {
  const { t } = useI18n();
  const { address, unlockAdvisor, unlockingAdvisor, checkAccess } = useEthersContract();

  const advisors = [
    {
      type: "conservative" as AdvisorType,
      icon: Shield,
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"
    },
    {
      type: "growth" as AdvisorType,
      icon: TrendingUp,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
      type: "quantitative" as AdvisorType,
      icon: Binary,
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
    },
    {
      type: "meme" as AdvisorType,
      icon: Sparkles,
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"
    },
  ];

  const handleAdvisorClick = async (advisorType: AdvisorType) => {
    console.log('Clicking advisor:', advisorType);
    try {
      if (!address) {
        console.log('No wallet connected');
        alert("请先连接钱包");
        return;
      }

      console.log('Checking access for:', advisorType);
      const hasAccess = await checkAccess(advisorType);
      console.log('Has access:', hasAccess);

      if (!hasAccess) {
        console.log('Unlocking advisor:', advisorType);
        await unlockAdvisor(advisorType);
        console.log('Checking access again for:', advisorType);
        const accessGranted = await checkAccess(advisorType);
        console.log('Access granted:', accessGranted);
        if (!accessGranted) {
          return;
        }
      }
      onAdvisorSelect(advisorType);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
      <h2 className="font-semibold">{t('advisor.title')}</h2>
      {advisors.map((advisor) => (
        <Card key={advisor.type} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <advisor.icon className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">{t(`advisor.${advisor.type}.name`)}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(`advisor.${advisor.type}.description`)}
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleAdvisorClick(advisor.type)}
              disabled={unlockingAdvisor === advisor.type}
            >
              {unlockingAdvisor === advisor.type ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('advisor.unlock.unlocking')}
                </>
              ) : (
                <>
                  {t('advisor.unlock.button', { cost: '0.00001 ETH' })}
                </>
              )}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}