import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { cleanEnv, str } from "envalid";
import { SuiClient } from "@mysten/sui/client";

const IKA_PACKAGE_ID =
  "0xb874c9b51b63e05425b74a22891c35b8da447900e577667b52e85a16d4d85486";
const IKA_SYSTEM_ID =
  "0x215de95d27454d102d6f82ff9c54d8071eb34d5706be85b5c73cbd8173013c80";

const env = cleanEnv(process.env, {
  DESTINATION_ADDRESS: str(),
  IKA_VALIDATOR_COMMISSION_CAP_ID: str(),
  SUI_PRIVATE_KEY: str(),
  SUI_RPC_URL: str(),
});

const suiClient = new SuiClient({
  url: env.SUI_RPC_URL,
});

const keypair = Ed25519Keypair.fromSecretKey(env.SUI_PRIVATE_KEY);

const tx = new Transaction();
const amount = tx.moveCall({
  target: "0x1::option::none",
  arguments: [],
  typeArguments: ["u64"],
});
const commissionCoin = tx.moveCall({
  target: `${IKA_PACKAGE_ID}::system::collect_commission`,
  arguments: [
    tx.object(IKA_SYSTEM_ID),
    tx.object(env.IKA_VALIDATOR_COMMISSION_CAP_ID),
    amount,
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
