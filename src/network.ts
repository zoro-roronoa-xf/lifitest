import {
  Connection,
  PublicKey,
  TransactionInstruction,
  Transaction,
} from '@solana/web3.js'

export enum Network {
  MAIN = "Mainnet",
  DEV = "Devnet",
  LOCAL = "Local",
}

export const getProgramAddress = (network: Network) => {
  switch (network) {
    case Network.LOCAL:
      return 'CKVdGCWote2cBkjvXEcJW5wda2aK5oBJVupdh7x2gMii'
    case Network.DEV:
      return 'CKVdGCWote2cBkjvXEcJW5wda2aK5oBJVupdh7x2gMii'
    default:
      throw new Error('Unknown network')
  }
}


export async function sendSim(connection:Connection , instraction: TransactionInstruction, feePayer: PublicKey){

  const { value } = await connection.simulateTransaction(new Transaction({feePayer:feePayer}).add(instraction));

  return value

}

