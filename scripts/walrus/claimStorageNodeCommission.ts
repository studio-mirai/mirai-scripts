import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { cleanEnv, str } from "envalid";
import { SuiClient } from "@mysten/sui/client";

const WALRUS_PACKAGE_ID =
  "0xfa65cb2d62f4d39e60346fb7d501c12538ca2bbc646eaa37ece2aec5f897814e";
const WALRUS_STAKING_ID =
  "0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904";

const env = cleanEnv(process.env, {
  DESTINATION_ADDRESS: str(),
  SUI_PRIVATE_KEY: str(),
  SUI_RPC_URL: str(),
  WALRUS_STORAGE_NODE_ID: str(),
});

const suiClient = new SuiClient({
  url: env.SUI_RPC_URL,
});

const keypair = Ed25519Keypair.fromSecretKey(env.SUI_PRIVATE_KEY);

const tx = new Transaction();
const auth = tx.moveCall({
  target: `${WALRUS_PACKAGE_ID}::auth::authenticate_sender`,
  arguments: [],
  typeArguments: [],
});
const commissionCoin = tx.moveCall({
  target: `${WALRUS_PACKAGE_ID}::staking::collect_commission`,
  arguments: [
    tx.object(WALRUS_STAKING_ID),
    tx.object(env.WALRUS_STORAGE_NODE_ID),
    auth,
  ],
  typeArguments: [],
});
tx.transferObjects([commissionCoin], env.DESTINATION_ADDRESS);
const result = await suiClient.signAndExecuteTransaction({
  signer: keypair,
  transaction: tx,
});
await suiClient.waitForTransaction({ digest: result.digest });
console.log(`TX Digest: ${result.digest}`);
