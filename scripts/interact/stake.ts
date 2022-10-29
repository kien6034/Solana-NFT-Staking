import {Bot} from "../bot/bot";
import * as solana from "@solana/web3.js";
import * as spl from '@solana/spl-token';
import * as anchor from "@project-serum/anchor";
const Transaction = anchor.web3.Transaction;
import {createMintNft, transferToken} from "../utils/token";
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
    try {
      let stakeControllerInfo = await bot.getStakeControllerInfo(staker.publicKey);
    }catch{
      //if stake controller not created ===> create ix to gen stake controller first 
      let ix = await bot.getInitStakeControllerIx(staker);
      tx.add(ix);
    }

    let nftMint = new solana.PublicKey("8a4cZVahyAmXwRLkSZrr3Eb93DdJkdZUSrYCoivwis1G");
    let nftMint2= new solana.PublicKey("6gVKrnqgithqQCziGkUycBx8GQvKE6CXYongYn2Gzbe7");
    let ataAddress = await getAtaAccount(nftMint, staker.publicKey);
    let ataAddress2 = await getAtaAccount(nftMint2, staker.publicKey);


    let stake_ix = await bot.getStakeIx(staker, nftMint, ataAddress);
    let stake_ix2 = await bot.getStakeIx(staker, nftMint2, ataAddress2);
    tx.add(stake_ix);
    tx.add(stake_ix2);
    
    let wallet = provider.wallet;
    tx.feePayer = wallet.publicKey
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash
    const signedTx = await wallet.signTransaction(tx);
    const txId = await provider.connection.sendRawTransaction(signedTx.serialize())
    await provider.connection.confirmTransaction(txId)

    console.log(txId)
  }
  
  main().catch(error => console.log(error));