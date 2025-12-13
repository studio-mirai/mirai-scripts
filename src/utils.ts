import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { cleanEnv, str } from "envalid";
import type { TransactionResult } from "@mysten/sui/transactions";
import { bcs } from "@mysten/bcs";

export function getBaseEnv() {
  return cleanEnv(process.env, {
    SUI_PRIVATE_KEY: str(),
    SUI_RPC_URL: str(),
  });
}

export function createSuiClient(rpcUrl: string) {
  return new SuiClient({ url: rpcUrl });
}

export function createKeypair(privateKey: string) {
  return Ed25519Keypair.fromSecretKey(privateKey);
}

export async function executeTransaction(
  client: SuiClient,
  keypair: Ed25519Keypair,
  tx: Transaction
) {
  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });
  await client.waitForTransaction({ digest: result.digest });
  console.log(`TX Digest: ${result.digest}`);
  return result;
}

export async function extractCoinValue(
  tx: Transaction,
  coin: TransactionResult,
  coinType: string,
  client: SuiClient,
  sender: string
): Promise<bigint> {
  tx.moveCall({
    target: "0x2::coin::value",
    arguments: [coin],
    typeArguments: [coinType],
  });
  let dryRunResult = await client.devInspectTransactionBlock({
    transactionBlock: tx,
    sender,
  });
  const coinValueResult =
    dryRunResult.results?.[dryRunResult.results.length - 1];
  const coinInAmountBytes: Uint8Array | undefined = coinValueResult
    ?.returnValues?.[0]?.[0]
    ? new Uint8Array(coinValueResult.returnValues[0][0])
    : undefined;
  if (!coinInAmountBytes) {
    console.error("Error: coinInAmountBytes is undefined.");
    process.exit(1);
  }
  const coinInAmount = bcs.u64().parse(coinInAmountBytes!);
  return BigInt(coinInAmount);
}
