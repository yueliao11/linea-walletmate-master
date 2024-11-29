import { NextResponse } from 'next/server';
import { HemeraSDK } from '@hemera/sdk';

const hemeraSDK = new HemeraSDK({
  network: process.env.NETWORK_ENV || 'mainnet'
});

export async function GET() {
  try {
    const protocols = await hemeraSDK.getDefiProtocols({
      minApy: 5, // 最低 5% APY
      minTvl: 1000000, // 最低 100 万 TVL
      sortBy: 'apy'
    });

    return NextResponse.json(protocols);
  } catch (error) {
    console.error('Failed to fetch Hemera protocols:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DeFi protocols' },
      { status: 500 }
    );
  }
}