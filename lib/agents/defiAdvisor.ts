import { openai } from '@/lib/openai-config';
import { ADVISOR_PROMPTS } from '@/lib/advisorPrompts';

function calculateConfidence(tvl: number, apy: number): number {
  if (tvl > 1000000000) return 90;
  if (tvl > 100000000) return 75;
  if (tvl > 10000000) return 60;
  return 40;
}

function calculateRisk(tvl: number, apy: number): string {
  if (tvl > 1000000000 && apy < 20) return '低';
  if (tvl > 100000000 && apy < 50) return '中';
  return '高';
}

export async function analyzeDeFiProtocols(protocols: any[]) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        recommendations: protocols.slice(0, 5).map(p => ({
          ...p,
          riskLevel: calculateRisk(p.tvl, p.apy),
          aiAnalysis: "AI 分析暂时不可用"
        }))
      };
    }
    
    // 为每个协议单独生成分析
    const analyzedProtocols = await Promise.all(
      protocols.slice(0, 5).map(async (p) => {
        const completion = await openai.chat.completions.create({
          model: "yi-large",
          messages: [
            {
              role: "system",
              content: "你是一位专业的 DeFi 投资顾问。请用不超过15字简要分析该协议的优势或风险。"
            },
            {
              role: "user",
              content: `分析该DeFi协议:\n名称: ${p.name}\nTVL: ${p.tvl}\nAPY: ${p.apy}%\n交易量: ${p.volume || 0}`
            }
          ]
        });

        return {
          ...p,
          riskLevel: calculateRisk(p.tvl, p.apy),
          aiAnalysis: completion.choices[0].message.content
        };
      })
    );

    return { recommendations: analyzedProtocols };
  } catch (error) {
    console.error('DeFi analysis failed:', error);
    return { recommendations: [] };
  }
}