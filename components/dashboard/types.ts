export type TradeDirection = "Long" | "Short";

export type Trade = {
  id: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  setup: string;
  notes: string;
  pnl: number;
  result: "Win" | "Loss" | "Breakeven";
};

export type EquityPoint = {
  day: string;
  equity: number;
};

export type TradingDay = {
  day: number;
  pnl: number;
};
