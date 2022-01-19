export function PoolList(){
  return Object.keys(PoolInfo);
}

export function checkPool(pool: string){
  return pool in PoolInfo ? true : false;
}

export function checkFromMint(pool: string, fromMint: string){
  return PoolInfo[pool].poolCoinMint !== fromMint && new PoolInfo[pool].poolPcMint !== fromMint ? false : true;
}

export function getPoolInfo(fromMint: string, toMint: string) {
   const pools = Object.values(PoolInfo).filter(pool => ((pool.poolCoinMint === fromMint && pool.poolPcMint === toMint) || (pool.poolCoinMint === toMint && pool.poolPcMint === fromMint)));
   if (pools.length === 1){
     return pools[0]
   }else{
     return null
   }
}

export const PoolInfo = {
  "SOL-USDC" : {
    "amm" : "Dxd8TeYaDgqqnY3nbJwCdDXm9eoZUKvAREsrywqgGuVZ",
    "poolMint": "DjNZxdo3hhZepewy1EmBXarL3GeNJooDQfoWy4AhuDt9",
    "feeAccount": "7ugEdDGLrNjpLLHRNJ7TrPomfpMAz6k6UzbqntC4JBSx",
    "oracleAccount": "5nb5rbjqxQGSQf6AAn142QWC2Vge4R54c4gdy6z8cRNy",
    "pythAccount": "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix",
    "configAccount": "DgWp4UYnjgd4uLFtEL6CKxFVt45zcQrdrsZoZxZ8KFN2",
    "poolCoinTokenAccount": "5AcRJY6U5yRdjJW16DHxWtCkf7mTLC3Q6uWKW9TkbWe7",
    "poolCoinMint": "6w4vDgvkoWo3atEhkvkk76i5vogHahDeQhRfVwCm6zYo",
    "poolCoinDecimal" : 9,
    "poolPcTokenAccount": "AdQB1RCN99NuVP8Zk8591S7PG4y7xdvNUK9Z4kMuhLNk",
    "poolPcMint": "3BW9dFeD7Cq56GyxsP6aT7SPKKn1jmwmtnCBnvbk3U7A",
    "poolPcDecimal" : 6,
  },
  "mSOL-USDC" : {
    "amm" : "Dxd8TeYaDgqqnY3nbJwCdDXm9eoZUKvAREsrywqgGuV1",
    "poolMint": "DjNZxdo3hhZepewy1EmBXarL3GeNJooDQfoWy4AhuDt1",
    "feeAccount": "7ugEdDGLrNjpLLHRNJ7TrPomfpMAz6k6UzbqntC4JBS1",
    "oracleAccount": "5nb5rbjqxQGSQf6AAn142QWC2Vge4R54c4gdy6z8cRN1",
    "pythAccount": "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVki1",
    "configAccount": "DgWp4UYnjgd4uLFtEL6CKxFVt45zcQrdrsZoZxZ8KFN1",
    "poolCoinTokenAccount": "5AcRJY6U5yRdjJW16DHxWtCkf7mTLC3Q6uWKW9TkbWe1",
    "poolCoinMint": "6w4vDgvkoWo3atEhkvkk76i5vogHahDeQhRfVwCm6zY1",
    "poolCoinDecimal" : 9,
    "poolPcTokenAccount": "AdQB1RCN99NuVP8Zk8591S7PG4y7xdvNUK9Z4kMuhLN1",
    "poolPcMint": "3BW9dFeD7Cq56GyxsP6aT7SPKKn1jmwmtnCBnvbk3U71",
    "poolPcDecimal" : 6,
  },
};
