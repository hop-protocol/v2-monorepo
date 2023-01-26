export interface ExitRelayer {
  getExitPopulatedTx (l2TxHash: string): Promise<any>
}
