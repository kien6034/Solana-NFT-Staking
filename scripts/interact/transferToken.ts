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

    // Transfer token to the contract 
    let userAtaAccount = await getAtaAccount(mint, bot.deployer.publicKey);
    let vaultPDA = await bot.getVaultPDA();
    await transferToken(bot.provider, userAtaAccount, vaultPDA.key, bot.deployer, 1000000);
}
  
  main().catch(error => console.log(error));