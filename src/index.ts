import { PublicKey, Transaction, Keypair } from '@solana/web3.js'

import { Lifinity } from './lifinity_amm'
import { getProgramAddress, Network } from './network'

export { Lifinity, Network, getProgramAddress }

export interface IWallet {
  signTransaction: (tx: Transaction) => Promise<Transaction>
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>
  publicKey: PublicKey
  payer: Keypair
}
