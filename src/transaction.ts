// import * as anchor from '@project-serum/anchor'
import { Program, BN } from '@project-serum/anchor'
import {
  Keypair,
  PublicKey,
  Transaction,
  ConfirmOptions,
  SimulatedTransactionResponse,
  Connection,
} from '@solana/web3.js'
import { Token } from '@solana/spl-token'
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { closeAccount } from '@project-serum/serum/lib/token-instructions'
import { LifinityAmm as LifinityAmmType } from './idl/lifinity_amm'
import { PoolInfo } from './types';
import { NATIVE_SOL, WSOL } from './tokens'
import {
  findAssociatedTokenAddress,
  createWSOLAccountIfNotExist,
  createAssociatedTokenAccountIfNotExist,
  getProgramAuthority
} from './utils'
import { IWallet } from '.';

export interface Amount {
  in: number,
  out: number,
}

export interface TotalFee {
  fee: number,
  percent: number,
}

export async function simulateSwap(
  program: Program<LifinityAmmType>,
  pool: PoolInfo,
  fromTokenMint: PublicKey,
  toTokenMint: PublicKey,
  amountIn: number,
  connection: Connection,
  wallet: IWallet,
) {
  // let {transaction, signers} = await makeSwapAllInstractions(program, fromTokenMint, toTokenMint, pool, amountIn, 0, true);
  // console.log("transaction:",transaction)
  // console.log("signers:",signers)

  // transaction.recentBlockhash = (await program.provider.connection.getRecentBlockhash()).blockhash
  // transaction.setSigners(program.provider.wallet.publicKey, ...signers.map((s) => s.publicKey))
  // if (signers.length > 0) {
  //   transaction.partialSign(...signers)
  // }

  // let opt : ConfirmOptions = { commitment: 'singleGossip', skipPreflight: false };


  // return await program.provider.simulate(transaction,signers, opt);

  // console.log("1")
  // const { value } = await program.provider.simulate(
  //   new Transaction({ feePayer: program.provider.wallet.publicKey }).add(...transaction.instructions)
  // )
  // console.log(value)
  // console.log("2")

  let transaction = new Transaction();

  let { programAuthority } = await getProgramAuthority(program.programId, new PublicKey(pool.amm))

  let amountInBN: BN;
  let minimumAmountOutBN = new BN(0);

  let fromPoolAccount: PublicKey;
  let toPoolAccount: PublicKey;

  if (fromTokenMint.toString() === pool.poolCoinMint) {
    amountInBN = new BN(amountIn).sub(new BN(10).pow(new BN(pool.poolCoinDecimal)));
    fromPoolAccount = new PublicKey(pool.poolCoinTokenAccount);
    toPoolAccount = new PublicKey(pool.poolPcTokenAccount);
  }else{
    amountInBN = new BN(amountIn).sub(new BN(10).pow(new BN(pool.poolPcDecimal)));
    fromPoolAccount = new PublicKey(pool.poolPcTokenAccount);
    toPoolAccount = new PublicKey(pool.poolCoinTokenAccount);
  }
  
  transaction.add(
    program.instruction.swapAmount(amountInBN,minimumAmountOutBN,
      {
        accounts: {
          authority: programAuthority,
          amm: new PublicKey(pool.amm),
          swapSource: fromPoolAccount,
          swapDestination: toPoolAccount,
          poolMint: new PublicKey(pool.poolMint),
          feeAccount: new PublicKey(pool.feeAccount),
          tokenProgram: TOKEN_PROGRAM_ID,
          oracleAccount: new PublicKey(pool.oracleAccount),
          pythAccount: new PublicKey(pool.pythAccount),
          configAccount: new PublicKey(pool.configAccount),
        }
      }
    )
  );
  
  return await connection.simulateTransaction(transaction);
  // return await program.provider.connection.simulateTransaction(transaction,signers);
}

export async function sendSwap(
  program: Program<LifinityAmmType>,
  pool: PoolInfo,
  fromTokenMint: PublicKey,
  toTokenMint: PublicKey,
  amountIn: number,
  minimumAmountOut: number
) {
  const {transaction, signers} = await makeSwapAllInstractions(program, fromTokenMint, toTokenMint, pool, amountIn, minimumAmountOut, false);
  return await program.provider.send(transaction,signers);
}

export async function getAInstraction(
  program : Program<LifinityAmmType>,
  pool : PoolInfo,
  amountIn: number,
  minimumOut: number,
  fromTokenMint : PublicKey,
  toTokenMint : PublicKey,
) {

  let { programAuthority } = await getProgramAuthority(program.programId, new PublicKey(pool.amm))

  let amountInBN: BN;
  let minimumAmountOutBN = new BN(0);

  let fromPoolAccount: PublicKey;
  let toPoolAccount: PublicKey;

  if (fromTokenMint.toString() === pool.poolCoinMint) {
    amountInBN = new BN(amountIn).sub(new BN(10).pow(new BN(pool.poolCoinDecimal)));
    minimumAmountOutBN = new BN(minimumOut).sub(new BN(10).pow(new BN(pool.poolPcDecimal)));
    fromPoolAccount = new PublicKey(pool.poolCoinTokenAccount);
    toPoolAccount = new PublicKey(pool.poolPcTokenAccount);
  }else{
    amountInBN = new BN(amountIn).sub(new BN(10).pow(new BN(pool.poolPcDecimal)));
    minimumAmountOutBN = new BN(minimumOut).sub(new BN(10).pow(new BN(pool.poolCoinDecimal)));
    fromPoolAccount = new PublicKey(pool.poolPcTokenAccount);
    toPoolAccount = new PublicKey(pool.poolCoinTokenAccount);
  }
  return program.instruction.swapAmount(amountInBN,minimumAmountOutBN,
    {
      accounts: {
        authority: programAuthority,
        amm: new PublicKey(pool.amm),
        swapSource: fromPoolAccount,
        swapDestination: toPoolAccount,
        poolMint: new PublicKey(pool.poolMint),
        feeAccount: new PublicKey(pool.feeAccount),
        tokenProgram: TOKEN_PROGRAM_ID,
        oracleAccount: new PublicKey(pool.oracleAccount),
        pythAccount: new PublicKey(pool.pythAccount),
        configAccount: new PublicKey(pool.configAccount),
      }
    }
  )

  // transaction.recentBlockhash = (await program.provider.connection.getRecentBlockhash()).blockhash
  // transaction.setSigners(program.provider.wallet.publicKey, ...signers.map((s) => s.publicKey))
  // if (signers.length > 0) {
  //   transaction.partialSign(...signers)
  // }

  // return {transaction, signers};
}

export async function getInstraction(
  program : Program<LifinityAmmType>,
  pool : PoolInfo,
  amountIn: number,
  minimumOut: number,
  fromUserAccount : PublicKey,
  toTokenAccount : PublicKey,
  fromPoolAccount : PublicKey,
  toPoolAccount : PublicKey,
) {
  let transaction = new Transaction();
  let signers = [];

  let swapAmountIn = new BN(amountIn);
  let swapMinimumAmountOut = new BN(minimumOut);

  await makeLifiInstractioin(
    program,
    transaction,
    signers,
    fromUserAccount,
    toTokenAccount,
    fromPoolAccount,
    toPoolAccount,
    swapAmountIn,
    swapMinimumAmountOut,
    pool,
    false,
  );

  // transaction.recentBlockhash = (await program.provider.connection.getRecentBlockhash()).blockhash
  // transaction.setSigners(program.provider.wallet.publicKey, ...signers.map((s) => s.publicKey))
  // if (signers.length > 0) {
  //   transaction.partialSign(...signers)
  // }

  return {transaction, signers};
}

async function makeSwapAllInstractions(
  program : Program<LifinityAmmType>,
  fromTokenMint : PublicKey, 
  toTokenMint : PublicKey, 
  pool : PoolInfo,
  amountIn: number,
  minimumAmountOut: number,
  simulate : boolean = false,
) {
  let transaction = new Transaction();
  let signers = [];

  let amountInBN: BN;
  let minimumAmountOutBN: BN;
  let fromPoolAccount: PublicKey;
  let toPoolAccount: PublicKey;
  
  if (fromTokenMint.toString() === pool.poolCoinMint) {
    amountInBN = new BN(amountIn).sub(new BN(10).pow(new BN(pool.poolCoinDecimal)));
    minimumAmountOutBN = new BN(minimumAmountOut).sub(new BN(10).pow(new BN(pool.poolPcDecimal)));
    fromPoolAccount = new PublicKey(pool.poolCoinTokenAccount);
    toPoolAccount = new PublicKey(pool.poolPcTokenAccount);
  }else{
    amountInBN = new BN(amountIn).sub(new BN(10).pow(new BN(pool.poolPcDecimal)));
    minimumAmountOutBN = new BN(minimumAmountOut).sub(new BN(10).pow(new BN(pool.poolCoinDecimal)));
    fromPoolAccount = new PublicKey(pool.poolPcTokenAccount);
    toPoolAccount = new PublicKey(pool.poolCoinTokenAccount);
  }

  let fromMintAddress = fromTokenMint;
  let toMintAddress = toTokenMint;

  if (fromTokenMint.toString() === NATIVE_SOL.mintAddress) {
    fromMintAddress = new PublicKey(WSOL.mintAddress);
  }
  if (toTokenMint.toString() === NATIVE_SOL.mintAddress) {
    toMintAddress = new PublicKey(WSOL.mintAddress);
  }

  let fromUserAccount: PublicKey | null = null
  let toTokenAccount: PublicKey | null = null

  if (fromTokenMint.toString() === NATIVE_SOL.mintAddress) {
    console.log("SOL")
    fromUserAccount = await createWSOLAccountIfNotExist(
      program,
      fromUserAccount,
      amountInBN.toNumber(),
      transaction,
      signers
    );
  }else{
    console.log("!SOL")
    fromUserAccount = await findAssociatedTokenAddress(
      program.provider.wallet.publicKey,
      fromMintAddress
    );
  }
  console.log("fromUserAccount:",fromUserAccount.toString())

  console.log("signers1:",signers)

  if (toTokenMint.toString() === NATIVE_SOL.mintAddress) {
    toTokenAccount = await createWSOLAccountIfNotExist(
      program,
      toTokenAccount,
      0,
      transaction,
      signers
    );
  }else{
    toTokenAccount = await createAssociatedTokenAccountIfNotExist(
      program,
      toMintAddress,
      transaction,
    );
  }

  console.log("signers2:",signers)

  await makeLifiInstractioin(
    program,
    transaction,
    signers,
    fromUserAccount,
    toTokenAccount,
    fromPoolAccount,
    toPoolAccount,
    amountInBN,
    minimumAmountOutBN,
    pool,
    simulate,
  );

  if (toTokenMint.toString() === NATIVE_SOL.mintAddress) {
    transaction.add(
      closeAccount({
        source: toTokenAccount,
        destination: program.provider.wallet.publicKey,
        owner: program.provider.wallet.publicKey
      })
    )
  }

  console.log("signers3:",signers)

  return {transaction, signers};
}


async function makeLifiInstractioin(
  program: Program<LifinityAmmType>,
  transaction: Transaction,
  signers: any[],
  fromUserAccount: PublicKey,
  toTokenAccount: PublicKey,
  fromPoolAccountAccount: PublicKey,
  toPoolAccountAccount: PublicKey,
  amountIn: BN,
  minimumOut: BN,
  pool: PoolInfo,
  simulate : boolean = false,
) {

  const userTransferAuthority = Keypair.generate();

  if (!simulate) {
    transaction.add(
      Token.createApproveInstruction(
        TOKEN_PROGRAM_ID,
        fromUserAccount,
        userTransferAuthority.publicKey,
        program.provider.wallet.publicKey,
        [],
        amountIn.toNumber(),
      )
    );
    signers.push(userTransferAuthority)
  }

  let { programAuthority } = await getProgramAuthority(program.programId, new PublicKey(pool.amm))

  transaction.add(
    program.instruction.swap(amountIn,minimumOut,
      {
        accounts: {
          authority: programAuthority,
          amm: new PublicKey(pool.amm),
          userTransferAuthority: userTransferAuthority.publicKey,
          sourceInfo: fromUserAccount,
          destinationInfo: toTokenAccount,
          swapSource: fromPoolAccountAccount,
          swapDestination: toPoolAccountAccount,
          poolMint: new PublicKey(pool.poolMint),
          feeAccount: new PublicKey(pool.feeAccount),
          tokenProgram: TOKEN_PROGRAM_ID,
          oracleAccount: new PublicKey(pool.oracleAccount),
          pythAccount: new PublicKey(pool.pythAccount),
          configAccount: new PublicKey(pool.configAccount),
        }
      }
    )
  );
}

export function searchLog(value: SimulatedTransactionResponse, pool: PoolInfo, fromTokenMint: string) {
  let amountDecimal : number;
  let feeDecimal : number;
  if (fromTokenMint === pool.poolCoinMint){
    amountDecimal = pool.poolPcDecimal;
    feeDecimal = pool.poolCoinDecimal;
  }else{
    amountDecimal = pool.poolCoinDecimal;
    feeDecimal = pool.poolPcDecimal;
  }

  const amountOut = findLogAndParse<Amount>(value?.logs, 'Amount').out / 10 ** amountDecimal;
  const fee = findLogAndParse<TotalFee>(value?.logs, 'TotalFee').fee / 10 ** feeDecimal;

  console.log("amountOut:",amountOut,"fee:",fee);

  return { amountOut, fee }
}

function findLogAndParse<T>(logs: string[] | null, name: string): T {
  const re = new RegExp(`${name}: (\\{.+\\})`, 'i')

  let result: T | undefined
  logs?.find((log) => {
    const match = log.match(re)
    if (match?.length === 2) {
      result = JSON.parse(match[1]) as T
    }
    return match
  })

  if (!result) {
    throw new Error(`Failed to find log in logs: ${logs}`)
  }
  return result
}
