import {Bot} from "../bot/bot";
import * as solana from "@solana/web3.js";
import * as spl from '@solana/spl-token';
import * as anchor from "@project-serum/anchor";
const Transaction = anchor.web3.Transaction;
import {createMintNft} from "../utils/token";
import { getAtaAccount, getTokenMetadata } from "../utils/pda";


const fs = require("fs");


const  main= async()=>{
    const data_path = "scripts/data.json"
    const file = fs.readFileSync(data_path, 'utf8');
    const data = JSON.parse(file);

    const mint = new solana.PublicKey(data["reward_token"]);
    let collection = new solana.PublicKey(data["collection"]);
    let internal_id = data["pool_id"];

    let bot = new Bot(mint, internal_id);

    let staker =  bot.deployer;   
    let provider =  bot.provider;

    let tx = new Transaction();
    let nftMint = new solana.PublicKey("5QJpLVMZBtF57P1kbRf4SfAfCWfnR3m5L93RMX8wRVnX");
    let ataAddress = await getAtaAccount(nftMint, staker.publicKey);
    let staker_reward_token_account = await getAtaAccount(mint, staker.publicKey);

    let claim_ix = await bot.getClaimIx(staker, nftMint, staker_reward_token_account);
    //let ix2 = await bot.getStakeIx(deployer, nftMint2, ataMintAccount2);
    tx.add(claim_ix);
    
    let wallet = provider.wallet;
    tx.feePayer = wallet.publicKey
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash
    const signedTx = await wallet.signTransaction(tx);
    const txId = await provider.connection.sendRawTransaction(signedTx.serialize())
    await provider.connection.confirmTransaction(txId)

    console.log(txId)
  }
  
  main().catch(error => console.log(error));