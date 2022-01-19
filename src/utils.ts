// import * as anchor from '@project-serum/anchor'
import { Program } from '@project-serum/anchor'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import { Token } from '@solana/spl-token'
import { initializeAccount } from '@project-serum/serum/lib/token-instructions'
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { LifinityAmm as LifinityAmmType } from './idl/lifinity_amm'
import { WSOL } from './tokens'

const ASSOCIATED_TOKEN_PROGRAM_ID: PublicKey = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

export async function createWSOLAccountIfNotExist(
  program: Program<LifinityAmmType>,
  account: PublicKey | undefined | null,
  amountIn: number,
  transaction: Transaction,
  signer: any[]
) {
  let publicKey: PublicKey

  if (account) {
    publicKey = account
  } else {
    const owner = program.provider.wallet.publicKey
    const newAccount = Keypair.generate();
    publicKey = newAccount.publicKey

    let lamports = amountIn + (await program.provider.connection.getMinimumBalanceForRentExemption(AccountLayout.span));
  
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: publicKey,
        lamports: lamports,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID
      })
    )

    transaction.add(
      initializeAccount({
        account: publicKey,
        mint: new PublicKey(WSOL.mintAddress),
        owner
      })
    )
    signer.push(publicKey)
  }

  return publicKey
}

export async function createAssociatedTokenAccountIfNotExist(
  program: Program<LifinityAmmType>,
  tokenMintAddress: PublicKey,
  transaction: Transaction,
) {

  let account = await findAssociatedTokenAddress(program.provider.wallet.publicKey, tokenMintAddress);

  await program.provider.connection.getAccountInfo(account).then(async (info) => {
    console.log("info:",info)
    if (!info) {
      account = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenMintAddress, program.provider.wallet.publicKey)
      transaction.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          tokenMintAddress,
          account,
          program.provider.wallet.publicKey,
          program.provider.wallet.publicKey
        )
      )
    }
  });
  return account;
}

export async function findAssociatedTokenAddress(walletAddress: PublicKey, tokenMintAddress: PublicKey) {

  console.log("walletAddress:",walletAddress.toString());
  console.log("tokenMintAddress:",tokenMintAddress.toString());
  console.log("TOKEN_PROGRAM_ID:",TOKEN_PROGRAM_ID.toString());

  console.log("walletAddress:",walletAddress);
  console.log("tokenMintAddress:",tokenMintAddress);
  console.log("TOKEN_PROGRAM_ID:",TOKEN_PROGRAM_ID);

  const { publicKey } = await findProgramAddress(
    [walletAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
  return publicKey
}

export async function findProgramAddress(seeds: Array<Buffer | Uint8Array>, programId: PublicKey) {
  const [publicKey, nonce] = await PublicKey.findProgramAddress(seeds, programId)
  return { publicKey, nonce }
}

export async function getProgramAuthority(id: PublicKey, publickey: PublicKey) {
  const [programAuthority, nonce] = await PublicKey.findProgramAddress(
    [publickey.toBuffer()],
    id
  )
  return {
    programAuthority,
    nonce
  }
}

export const sleep = async (ms: number) => {
  return await new Promise(resolve => setTimeout(resolve, ms))
}
