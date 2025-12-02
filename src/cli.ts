#!/usr/bin/env bun
import { program } from "commander";
import { registerSuiCommands } from "./commands/sui.js";
import { registerWalrusCommands } from "./commands/walrus.js";
import { registerIkaCommands } from "./commands/ika.js";

program
  .name("validator")
  .description("CLI for validator and storage node operations")
  .version("1.0.0");

registerSuiCommands(program);
registerWalrusCommands(program);
registerIkaCommands(program);

program.parse();
