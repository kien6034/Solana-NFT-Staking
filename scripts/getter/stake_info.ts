import {Bot} from "../bot/bot";
import * as solana from "@solana/web3.js";
import * as spl from '@solana/spl-token';
import * as anchor from "@project-serum/anchor";
const Transaction = anchor.web3.Transaction;
import {createMintNft} from "../utils/token";
import { getAtaAccount, getTokenMetadata } from "../utils/pda";


const fs = require("fs");
/**
 * @dev stake info holds information of a stake of a user (a nft a user stake in a staking pool)
 * Example: {
   stakeTime: <BN: 630b8c51>,
    mintOfNft: PublicKey {
      _bn: <BN: 1ee31c5afb7cd377b1b49de996b3546ad14a7e9e2c29d76c630007b6617e1595>
    },
    rewardDebt: <BN: b2834>,
    claimedReward: <BN: 0>,
    pendingReward: <BN: 0>,
    bump: 254
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
    let nftMint = new solana.PublicKey("35a69sNeWqtnVsujK2Kdq3LbQXTYwEtiHcp86umK8nmJ");
    let stakeInfo = await bot.getStakeInfo(bot.deployer.publicKey,nftMint);
    console.log(stakeInfo);
  }
  
  main().catch(error => console.log(error));