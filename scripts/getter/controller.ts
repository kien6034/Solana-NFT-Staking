import {Bot} from "../bot/bot";
import * as solana from "@solana/web3.js";
import * as spl from '@solana/spl-token';
import * as anchor from "@project-serum/anchor";
const Transaction = anchor.web3.Transaction;
import {createMintNft} from "../utils/token";
import { getAtaAccount, getTokenMetadata } from "../utils/pda";

const fs = require("fs");


/**
 * @dev controller holds general information of a staking pool
 * {
    internalId: 'kien01',
    collection: PublicKey {
        _bn: <BN: 892df050071e77ec1ba612d8499a7ec0e00f18388b88a4cfce05f4776ddb9b46>
    },
    rewardPerTokenPerSecond: <BN: 1>,
    startTime: <BN: 6300641d>,
    endTime: <BN: 0>,
    authorizer: PublicKey {
        _bn: <BN: 5e495edf4b39234534a24377475671313916f71cbb2aff5b690562de07fc449a>
    },
    accumulatedDebt: <BN: 0>,
    lastUpdateTime: <BN: 6300641d>,
    totalAmountStaked: <BN: 1>,
    totalRewardClaimed: <BN: 0>,
    totalUserStaked: <BN: 1>,
    bump: 251
    }
 */
const  main= async()=>{
    const data_path = "scripts/data.json"
    const file = fs.readFileSync(data_path, 'utf8');
    const data = JSON.parse(file);

    const mint = new solana.PublicKey(data["reward_token"]);
    let collection = new solana.PublicKey(data["collection"]);
    let internal_id = data["pool_id"];

    let bot = new Bot(mint, internal_id);
    let controllerInfo = await bot.getControllerInfo();
    console.log(controllerInfo);
  }
  
  main().catch(error => console.log(error));