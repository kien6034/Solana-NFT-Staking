import {Bot} from"../bot/bot";
import * as solana from "@solana/web3.js";
import * as spl from '@solana/spl-token';
import * as anchor from "@project-serum/anchor";
import {transferToken, getAtaAccount} from "../utils/token";
import { transfer } from "@solana/spl-token";
 

const fs = require("fs");


const  main= async()=>{
    const data_path = "scripts/data.json"
    const file = fs.readFileSync(data_path, 'utf8');
    const data = JSON.parse(file);
   
    const mint = new solana.PublicKey(data["reward_token"]);
    let internal_id = data["pool_id"];
    let bot = new Bot(mint, internal_id);

    const rewardPerTokenPerSecond = new anchor.BN(1);
    const startTime = new anchor.BN(1660970013);
    const endTime =  new anchor.BN(0);
    const lockDuration =  new anchor.BN(0);
    let collection = new solana.PublicKey(data["collection"]);


    //init the staking pool 
    let tx = await bot.initialize(
      rewardPerTokenPerSecond,
      startTime,
      endTime,
      lockDuration,
      null // alow any nft to stake 
      );

    console.log(tx)

    // Transfer token to the contract 
    // Note: This step is not needed in FE 
    let userAtaAccount = await getAtaAccount(mint, bot.deployer.publicKey);
    let vaultPDA = await bot.getVaultPDA();
    await transferToken(bot.provider, userAtaAccount, vaultPDA.key, bot.deployer, 1000000);
}
  
  main().catch(error => console.log(error));