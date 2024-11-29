"use client";

import { useMemeMarket } from '@/hooks/useMemeMarket';
import { useI18n } from '@/lib/i18n/I18nContext';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { AnimatedList } from './ui/animated-list';
interface Item {
  name: string;
  description: JSX.Element;
  icon: string;
  color: string;
  price: string;
  aiSentiment: string;
}
const MAX_NUM_TEXT = 60;
function getRandomEmoji() {
  // 定义一个包含常见 emoji 的数组
  const emojis = [
    "😀", "😂", "🥺", "😍", "🤔", "😎", "🤩", "🥳", "😜", "🤗",
    "😡", "😭", "😱", "🤖", "💩", "🔥", "🌟", "💎", "❤️", "🍕",
    "🌍", "🎉", "✨", "🦄", "🌈", "🐶", "🐱", "🦁", "🐰", "🐯"
  ];

  // 随机选择一个 emoji
  const randomIndex = Math.floor(Math.random() * emojis.length);
  return emojis[randomIndex];
}
function getRandomBrightColor() {
  // 随机生成 RGB 值，确保它们比较亮
  const r = Math.floor(Math.random() * 128) + 128; // 128 到 255 之间
  const g = Math.floor(Math.random() * 128) + 128; // 128 到 255 之间
  const b = Math.floor(Math.random() * 128) + 128; // 128 到 255 之间

  // 将 RGB 转换为 HEX 格式
  return `rgb(${r}, ${g}, ${b})`;
}
// Notification 组件
const Notification = ({ name, description, icon, color, price, aiSentiment }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto max-w-[98%] min-h-fit w-full cursor-pointer overflow-hidden rounded-2xl p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex items-center justify-center rounded-full w-10 h-10"
          style={{
            backgroundColor: color,
            aspectRatio: "1", // 保证宽高比例一致，形成圆形
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{price}</span>
          </figcaption>
          {/* Description 展示 */}
          <p className="text-sm font-normal dark:text-white/60 relative">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};


export function MemeMarquee({ enableCache = true }: { enableCache?: boolean }) {
  const { memeTokens, isLoading, error } = useMemeMarket(enableCache);
  const { t } = useI18n();
  // 获取 description 的函数，合并 24h change 和 aiSentiment
  const getDescription = (token: any) => {
    const changeText = `${token.change24h > 0 ? "↑" : "↓"} ${Math.abs(token.change24h).toFixed(2)}%`;
    const aiSentimentText = token.aiSentiment.length > MAX_NUM_TEXT
      ? token.aiSentiment.substring(0, MAX_NUM_TEXT) + '...'  // 超过 100 字的部分会被省略
      : token.aiSentiment;

    return <>
      <div>24h Change:  <span className={cn(
        "text-sm font-normal dark:text-white/60 relative",
        token.change24h > 0 ? "text-green-500" : token.change24h < 0 ? "text-red-500" : ""
      )}>{changeText}</span></div>
       <div className="text-sm text-gray-500">{aiSentimentText}</div>
    </>;
  };
  if (error) {
    return (
      <div className="p-2 text-sm text-destructive bg-destructive/10 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div>
        <h2 className="font-semibold">{t('meme.memeAnalysis')}</h2>
        <p className="text-sm text-muted-foreground my-2">
          Analysis MEME coins
        </p>
      </div>
      {
        isLoading ? (
          <>
            <Skeleton count={3} />
          </>
        ) : <div className="relative max-h-[600px] overflow-y-auto">
          <AnimatedList>
            {[...memeTokens].map((token, index) => (
              <Notification
                key={`${token.symbol}-${index}`}
                name={token.name}
                description={getDescription(token)} // 获取合并后的 description
                icon={getRandomEmoji()} // 随机生成一个 emoji
                color={getRandomBrightColor()} // 随机生成一个亮色
                price={`$${token.price.toFixed(4)}`}
                aiSentiment={token.aiSentiment} // 传递 aiSentiment 字段
              />
            ))}
          </AnimatedList>
        </div>
      }

    </div>
  );
} 