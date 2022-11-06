import {Bot} from "../bot/bot";
import * as solana from "@solana/web3.js";
import * as spl from '@solana/spl-token';
import * as anchor from "@project-serum/anchor";
const Transaction = anchor.web3.Transaction;
import {createMintNft} from "../utils/token";
import { getAtaAccount, getTokenMetadata } from "../utils/pda";

const fs = require("fs");

/**
 * @dev stake controller holds general information of a user in a staking pool
 * Example: { totalNftStaked: <BN: 1>, totalRewardClaimed: <BN: 0>, bump: 250 }
 */
const  main= async()=>{
    const data_path = "scripts/data.json"
    const file = fs.readFileSync(data_path, 'utf8');
    const data = JSON.parse(file);

    const mint = new solana.PublicKey(data["reward_token"]);
    let collection = new solana.PublicKey(data["collection"]);
    let internal_id = data["pool_id"];

    let bot = new Bot(mint, internal_id);
    let stakeControllerInfo = await bot.getStakeControllerInfo(bot.deployer.publicKey);
    console.log(stakeControllerInfo);
  }
  
  main().catch(error => console.log(error));