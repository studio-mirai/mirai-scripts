# Mirai Scripts

A collection of helpful scripts that we use everyday at Studio Mirai.

# Sui

## Claim Validator Reward

### Required Environment Variables

- `DESTINATION_ADDRESS` - The address to transfer rewards to.
- `SUI_PRIVATE_KEY` - Sui private key for the validator.
- `SUI_RPC_URL` - Sui RPC URL to use for the transaction.

```
bun run scripts/sui/claimValidatorReward.ts
```

## Set Validator Commission Rate

### Required Environment Variables

- `COMMISSION_RATE` - The new commission rate to set (e.g. 1000 for 10%).
- `SUI_PRIVATE_KEY` - Sui private key for the validator.
- `SUI_RPC_URL` - Sui RPC URL to use for the transaction.

```
bun run scripts/sui/setValidatorCommissionRate.ts
```

## Set Validator Gas Price

### Required Environment Variables

- `GAS_PRICE` - The new gas price to set (e.g. 300 for 300 MIST).
- `SUI_PRIVATE_KEY` - Sui private key for the validator.
- `SUI_RPC_URL` - Sui RPC URL to use for the transaction.
- `VALIDATOR_OPERATION_CAP_ID` - The operation capability object ID for your validator.

```
bun run scripts/sui/setValidatorGasPrice.ts
```
