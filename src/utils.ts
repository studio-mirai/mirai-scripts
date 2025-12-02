import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { cleanEnv, str } from "envalid";

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
