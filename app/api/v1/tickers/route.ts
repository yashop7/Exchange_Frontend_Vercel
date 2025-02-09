import { NextResponse } from 'next/server';
import { KLine } from '@/app/utils/types';

const BASE_URL = 'https://api.backpack.exchange/api/v1';

export interface Ticker {
    firstPrice: string;
    high: string;
    lastPrice: string;
    low: string;
    priceChange: string;
    priceChangePercent: string;
    quoteVolume: string;
    symbol: string;
    trades: string;
    volume: string;
}

export async function GET(): Promise<NextResponse<Ticker[] | { error: string }>> {
  try {
    const response = await fetch(`${BASE_URL}/tickers`);
    console.log("response: ", response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Ticker[] = await response.json();
    console.log("data: ", data);
    return NextResponse.json(data);
  } catch (error) {
    console.log("error: ", error);
    console.error('Failed to fetch tickers:', error);
    return NextResponse.json({ error: 'Failed to fetch tickers' }, { status: 500 });
  }
}