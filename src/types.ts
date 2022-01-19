export type TokenInfo = {
  symbol: string;
  mintAddress: string;
  decimals: number;
};

export type PoolInfo = {
  amm : string;
  poolMint: string;
  feeAccount: string;
  oracleAccount: string;
  pythAccount: string;
  configAccount: string;
  poolCoinTokenAccount: string;
  poolCoinMint: string;
  poolCoinDecimal: number;
  poolPcTokenAccount: string;
  poolPcMint: string;
  poolPcDecimal: number;
};
