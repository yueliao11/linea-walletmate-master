import { useState, useEffect } from 'react';

interface MemeToken {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  aiSentiment: string;
  riskLevel: string;
}

interface CachedMemeData {
  data: MemeToken[];
  timestamp: number;
}

const MEME_TOKENS = [
  { name: "Pepe", symbol: "PEPE" },
  { name: "Dogwifhat", symbol: "WIF" },
  { name: "BONK", symbol: "BONK" }
];

export function useMemeMarket(enableCache: boolean = true) {
  const [memeTokens, setMemeTokens] = useState<MemeToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedMemeData = (): CachedMemeData | null => {
    const cached = localStorage.getItem('meme_tokens');
    if (!cached) return null;
    
    const parsedCache = JSON.parse(cached);
    const cacheDuration = process.env.NEXT_PUBLIC_MEME_CACHE_DURATION || 1200000;
    
    if (Date.now() - parsedCache.timestamp < Number(cacheDuration)) {
      return parsedCache;
    }
    return null;
  };

  const setCachedMemeData = (data: MemeToken[]) => {
    localStorage.setItem('meme_tokens', JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  };

  useEffect(() => {
    async function fetchMemeTokens() {
      try {
        if (enableCache) {
          try {
            const cached = getCachedMemeData();
            if (cached) {
              setMemeTokens(cached.data);
              setIsLoading(false);
              return;
            }
          } catch (cacheError) {
            console.warn('Cache access failed:', cacheError);
          }
        }

        const updatedTokens = await Promise.all(
          MEME_TOKENS.map(async token => {
            try {
              const priceResponse = await fetch('/api/cryptocompare/price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol: token.symbol })
              });
              
              if (!priceResponse.ok) {
                throw new Error(`Price API error: ${priceResponse.statusText}`);
              }
              
              const priceData = await priceResponse.json();
              
              const sentimentResponse = await fetch('/api/meme/sentiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tokenSymbol: token.symbol,
                  price: priceData.price,
                  priceChange: priceData.change24h
                })
              });
              
              if (!sentimentResponse.ok) {
                throw new Error(`Sentiment API error: ${sentimentResponse.statusText}`);
              }
              
              const { sentiment } = await sentimentResponse.json();

              return {
                name: token.name,
                symbol: token.symbol,
                price: priceData.price || 0,
                change24h: priceData.change24h || 0,
                aiSentiment: sentiment || "无法获取AI分析",
                riskLevel: Math.abs(priceData.change24h || 0) > 10 ? "High" : "Medium"
              };
            } catch (error) {
              console.error(`Token数据获取失败: ${token.symbol}`, error);
              return null;
            }
          })
        );

        const validTokens = updatedTokens.filter(Boolean);
        if (validTokens.length > 0) {
          setMemeTokens(validTokens);
          if (enableCache) {
            try {
              setCachedMemeData(validTokens);
            } catch (cacheError) {
              console.warn('Failed to cache meme data:', cacheError);
            }
          }
          setError(null);
        } else {
          throw new Error('没有获取到有效的代币数据');
        }
      } catch (error) {
        console.error('Meme tokens fetch failed:', error);
        setError('获取MEME代币数据失败');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMemeTokens();
  }, [enableCache]);

  return { memeTokens, isLoading, error };
} 