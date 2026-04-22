import axios from "axios";
import { Depth, KLine, Ticker, Trade } from "./types";
import { globalLimiter, klineLimiter } from "./rateLimiter";

export const BASE_URL = '/api/engine';

export class RateLimitError extends Error {
  retryAfterSec: number;
  constructor(message: string, retryAfterSec: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSec = retryAfterSec;
  }
}

function checkGlobal() {
  const { allowed, retryAfterSec } = globalLimiter.check();
  if (!allowed) throw new RateLimitError(`Too many requests. Try again in ${retryAfterSec}s.`, retryAfterSec);
}

function is429(err: unknown): number | null {
  if (axios.isAxiosError(err) && err.response?.status === 429) {
    const retryAfter = parseInt(err.response.headers["retry-after"] ?? "30", 10);
    return isNaN(retryAfter) ? 30 : retryAfter;
  }
  return null;
}


export async function getTicker(market: string): Promise<Ticker> {
  const tickers = await getTickers();
  return tickers?.find((t: Ticker) => t.symbol === market);
}

export async function getAllInfo() {
  try {
    const response = await fetch('https://price-indexer.workers.madlads.com/?ids=solana,usd-coin,pyth-network,jito-governance-token,tether,bonk,helium,helium-mobile,bitcoin,ethereum,dogwifcoin,jupiter-exchange-solana,parcl,render-token,tensor,wormhole,wen-4,cat-in-a-dogs-world,book-of-meme,raydium,hivemapper,kamino,drift-protocol,nyan,jeo-boden,habibi-sol,io,zeta,mother-iggy,sanctum-2,moo-deng,debridge,shuffle-2,pepe,shiba-inu,chainlink,uniswap,ondo-finance,holograph,starknet,matic-network,mon-protocol,blur,worldcoin-wld,polyhedra-network,unagi-token,layerzero,aave,lido-dao,matr1x,polygon-ecosystem-token');
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("getAllInfo error:", error);
  }
}

export async function getTickers() {
  try {
    const response = await fetch('/api/tickers');
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("getTickers error:", error);
  }
}

export async function getDepth(market: string): Promise<Depth> {
  checkGlobal();
  try {
    const endpoint = market === 'TATA_INR' ? `${BASE_URL}/depth` : '/api/v1/depth';
    const response = await fetch(`${endpoint}?symbol=${market}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (err) {
    const sec = is429(err);
    if (sec !== null) throw new RateLimitError(`Rate limit reached. Try again in ${sec}s.`, sec);
    throw err;
  }
}

export async function getTrades(market: string): Promise<Trade[]> {
  checkGlobal();
  try {
    const response = await fetch(`${BASE_URL}/trades?symbol=${market}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (err) {
    const sec = is429(err);
    if (sec !== null) throw new RateLimitError(`Rate limit reached. Try again in ${sec}s.`, sec);
    throw err;
  }
}

export async function getKlines(market: string, interval: string, startTime: number, endTime: number) {
  const { allowed, retryAfterSec } = klineLimiter.check();
  if (!allowed) throw new RateLimitError(`Chart data rate limit (20/min). Try again in ${retryAfterSec}s.`, retryAfterSec);
  checkGlobal();

  try {
    const endpoint = market === 'TATA_INR'
      ? `${BASE_URL}/klines?market=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`
      : `/api/v1/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      if (response.status === 429) throw new RateLimitError("Chart data rate limit reached. Try again shortly.", 30);
      throw new Error('Network response was not ok');
    }
    const data: KLine[] = await response.json();
    return market === 'TATA_INR' ? data.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1)) : data;
  } catch (err) {
    const sec = is429(err);
    if (sec !== null) throw new RateLimitError(`Chart data rate limit. Try again in ${sec}s.`, sec);
    throw err;
  }
}

export async function getMarketKlines(startTime: number, endTime: number) {
  try {
    const response = await fetch(`https://api.backpack.exchange/wapi/v1/marketDataKlines?interval=6h&startTime=${startTime}&endTime=${endTime}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (err) {
    console.error('getMarketKlines error:', err);
  }
}
