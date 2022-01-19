// import * as anchor from '@project-serum/anchor'
import { Program, Provider } from '@project-serum/anchor'
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from '@solana/web3.js'
import { IWallet } from '.'
import { LifinityAmm as LifinityAmmType, IDL } from './idl/lifinity_amm'
import { getProgramAddress, Network, sendSim } from './network'
import { PoolList, checkPool, checkFromMint, getPoolInfo } from './pool'
import { simulateSwap, sendSwap, getInstraction, searchLog, getAInstraction } from './transaction'

export class Lifinity {
  public connection: Connection
  public wallet: IWallet
  public program: Program<LifinityAmmType>
  public stateAddress: PublicKey = PublicKey.default
  public programAuthority: PublicKey = PublicKey.default
  // public owner: Keypair

  private constructor(
    connection: Connection,
    wallet: IWallet,
    network: Network,
  ) {
    this.connection = connection
    this.wallet = wallet
    const programAddress = new PublicKey(getProgramAddress(network))
    const provider = new Provider(connection, wallet, Provider.defaultOptions())
    // @ts-ignore 
    // this.owner = provider.payer as Keypair;
    this.program = new Program(IDL, programAddress, provider)
  }

  static async build(
    connection: Connection,
    wallet: any,
    network: Network = Network.DEV,
  ): Promise<Lifinity> {
    const instance = new Lifinity(connection, wallet as IWallet, network)
    return instance
  }

  async getPoolSymbols() {
    return PoolList();
  }

  async getAmountOut(connection: Connection, amountIn: number, fromMint: PublicKey, toMint: PublicKey, slippage: number,simurationUser: PublicKey) {

    const pool = getPoolInfo(fromMint.toString(), toMint.toString())
    if (pool) {
      const instraction = await getAInstraction(this.program, pool, amountIn, 0, fromMint, toMint);

      const conn = new Connection('https://api.devnet.solana.com', 'confirmed');

      console.log("this connection:",this.connection)
      console.log("sdk connection:",connection)
      console.log("conn:",conn)

      const value = await sendSim(this.connection , instraction, simurationUser);

      // const { value } = await connection.simulateTransaction(new Transaction({feePayer:simurationUser}).add(instraction))
      // const { value } = await simulateSwap(this.program, pool, fromMint, toMint, amountIn, this.connection, this.wallet);
      console.log("return:",value)
      return searchLog(value, pool, fromMint.toString());
    }else{
      return { amountOut : 0, fee : 0 }
    }



    // const pool = getPoolInfo(fromMint.toString(), toMint.toString())
    // if (pool) {
    //   const { value } = await simulateSwap(this.program, pool, fromMint, toMint, amountIn, this.connection, this.wallet);
    //   console.log("return:",value)
    //   return searchLog(value, pool, fromMint.toString());
    // }else{
    //   return { amountOut : 0, fee : 0 }
    // }
  }

  async swap(amountIn: number, minimumAmountOut: number, fromMint: PublicKey, toMint: PublicKey) {
    const poolInfo = getPoolInfo(fromMint.toString(), toMint.toString())
    const tx = await sendSwap(this.program, poolInfo, fromMint, toMint, amountIn, minimumAmountOut);
    return tx
  }

  async getAmountInstraction(
    amountIn: number, 
    minimumOut: number,
    fromMint: PublicKey,
    toMint: PublicKey,
  ) {

    const pool = getPoolInfo(fromMint.toString(), toMint.toString())

    return await getAInstraction(
      this.program,
      pool,
      amountIn,
      minimumOut,
      fromMint,
      toMint,
    )
  }

  async getSwapInstraction(
    amountIn: number, 
    minimumOut: number,
    fromMint: PublicKey,
    toMint: PublicKey,
    fromUserAccount: PublicKey,
    toTokenAccount: PublicKey,
  ) {

    const pool = getPoolInfo(fromMint.toString(), toMint.toString())

    let fromPoolAccount: PublicKey;
    let toPoolAccount: PublicKey;

    if (fromMint.toString() === pool.poolCoinMint){
      fromPoolAccount = new PublicKey(pool.poolCoinTokenAccount);
      toPoolAccount = new PublicKey(pool.poolPcTokenAccount);
    }else{
      fromPoolAccount = new PublicKey(pool.poolPcTokenAccount);
      toPoolAccount = new PublicKey(pool.poolCoinTokenAccount);
    }

    return await getInstraction(
      this.program,
      pool,
      amountIn,
      minimumOut,
      fromUserAccount,
      toTokenAccount,
      fromPoolAccount,
      toPoolAccount,
    )
  }
}

export interface swapInfo {
  amountOut: number
  fee: number
}
