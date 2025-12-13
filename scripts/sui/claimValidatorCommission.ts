import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { cleanEnv, str } from "envalid";
import { SuiClient } from "@mysten/sui/client";

const env = cleanEnv(process.env, {
  DESTINATION_ADDRESS: str(),
  SUI_PRIVATE_KEY: str(),
  SUI_RPC_URL: str(),
});

const suiClient = new SuiClient({
  url: env.SUI_RPC_URL,
});

const keypair = Ed25519Keypair.fromSecretKey(env.SUI_PRIVATE_KEY);
const validatorAddress = keypair.getPublicKey().toSuiAddress();

const stakePositions = await suiClient.getStakes({
  owner: validatorAddress,
});
const stakeIds = [];
for (const stakePosition of stakePositions) {
  console.log(`Found ${stakePosition.stakes.length} stakes`);
  for (const stake of stakePosition.stakes) {
    stakeIds.push(stake.stakedSuiId);
  }
}
if (stakeIds.length === 0) {
  console.log(`No stakes found for ${validatorAddress}`);
  process.exit(0);
}

const tx = new Transaction();
const balance = tx.moveCall({
  target: "0x2::balance::zero",
  arguments: [],
  typeArguments: ["0x2::sui::SUI"],
});
for (const stakeId of stakeIds) {
  const withdrawnBalance = tx.moveCall({
    target: "0x3::sui_system::request_withdraw_stake_non_entry",
    arguments: [tx.object("0x5"), tx.object(stakeId)],
  });
  tx.moveCall({
    target: "0x2::balance::join",
    arguments: [balance, withdrawnBalance],
    typeArguments: ["0x2::sui::SUI"],
  });
}
const coin = tx.moveCall({
  target: "0x2::coin::from_balance",
  arguments: [balance],
  typeArguments: ["0x2::sui::SUI"],
});
tx.transferObjects([coin], env.DESTINATION_ADDRESS);
const result = await suiClient.signAndExecuteTransaction({
  signer: keypair,
  transaction: tx,
});
await suiClient.waitForTransaction({ digest: result.digest });
console.log(`TX Digest: ${result.digest}`);
