import type { Command } from "commander";
import { Transaction } from "@mysten/sui/transactions";
import { cleanEnv, str } from "envalid";
import {
  createSuiClient,
  createKeypair,
  executeTransaction,
} from "../utils.js";

export function registerWalrusCommands(program: Command) {
  const walrus = program
    .command("walrus")
    .description("Walrus storage node operations");

  walrus
    .command("claim")
    .description("Claim storage node commission")
    .action(claimStorageNodeCommission);
}

async function claimStorageNodeCommission() {
  const env = cleanEnv(process.env, {
    DESTINATION_ADDRESS: str(),
    SUI_PRIVATE_KEY: str(),
    SUI_RPC_URL: str(),
    WALRUS_PACKAGE_ID: str(),
    WALRUS_STAKING_PACKAGE_ID: str(),
    WALRUS_STORAGE_NODE_ID: str(),
  });

  const client = createSuiClient(env.SUI_RPC_URL);
  const keypair = createKeypair(env.SUI_PRIVATE_KEY);

  const tx = new Transaction();
  const auth = tx.moveCall({
    target: `${env.WALRUS_PACKAGE_ID}::auth::authenticate_sender`,
    arguments: [],
    typeArguments: [],
  });
  const commissionCoin = tx.moveCall({
    target: `${env.WALRUS_PACKAGE_ID}::staking::collect_commission`,
    arguments: [
      tx.object(env.WALRUS_STAKING_PACKAGE_ID),
      tx.object(env.WALRUS_STORAGE_NODE_ID),
      auth,
    ],
    typeArguments: [],
  });
  tx.transferObjects([commissionCoin], env.DESTINATION_ADDRESS);

  await executeTransaction(client, keypair, tx);
}
