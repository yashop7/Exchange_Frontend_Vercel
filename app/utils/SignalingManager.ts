import { Ticker } from "./types";

export const BP_BASE_URL = process.env.NEXT_PUBLIC_BP_WS_BASE_URL!;
export const BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL!;

export class SignalingManager {
  private ws: WebSocket | null = null;
  private static instance: SignalingManager;
  private bufferedMessages: any[] = [];
  private callbacks: any = {};
  private id: number;
  private initialized: boolean = false;

  private constructor() {
    this.bufferedMessages = [];
    this.id = 1;
  }

  public static getInstance(market?: string) {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }
    if (market) {
      this.instance.setMarket(market);
    }
    return this.instance;
  }

  public setMarket(market: string) {
    if (this.ws) {
      this.ws.close();
    }
    this.initialized = false;
    this.bufferedMessages = [];
    if (market === "TATA_INR") {
      this.ws = new WebSocket(BASE_URL);
    } else {
      this.ws = new WebSocket(BP_BASE_URL);
    }
    this.init();
  }

  init() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.initialized = true;
      this.bufferedMessages.forEach((message) => {
        this.ws?.send(JSON.stringify(message));
      });
      this.bufferedMessages = [];
    };
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const type = message.data.e;
      if (this.callbacks[type]) {
        this.callbacks[type].forEach(({ callback }: { callback: any }) => {
          if (type === "ticker") {
            const newTicker: Partial<Ticker> = {
              lastPrice: message.data.c,
              high: message.data.h,
              low: message.data.l,
              volume: message.data.v,
              quoteVolume: message.data.V,
              symbol: message.data.s,
            };
            callback(newTicker);
          }
          if (type === "depth") {
            const updatedBids = message.data.b;
            const updatedAsks = message.data.a;
            callback({ bids: updatedBids, asks: updatedAsks });
          }
          if (type === "trade") {
            const newTrade = {
              tradeId: message.data.t,
              isBuyerMaker: message.data.m,
              price: message.data.p,
              quantity: message.data.q,
              symbol: message.data.s,
            };
            callback(newTrade);
          }
        });
      }
    };
  }

  sendMessage(message: any) {
    if (!this.ws) return;
    
    const messageToSend = {
      ...message,
      id: this.id++,
    };
    if (!this.initialized) {
      this.bufferedMessages.push(messageToSend);
      return;
    }
    this.ws.send(JSON.stringify(messageToSend));
  }

  async registerCallback(type: string, callback: any, id: string) {
    this.callbacks[type] = this.callbacks[type] || [];
    this.callbacks[type].push({ callback, id });
  }

  async deRegisterCallback(type: string, id: string) {
    if (this.callbacks[type]) {
      const index = this.callbacks[type].findIndex(
        (callback: { id: string }) => callback.id === id
      );
      if (index !== -1) {
        this.callbacks[type].splice(index, 1);
      }
    }
  }
}
