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
    let nftMint = new solana.PublicKey("8a4cZVahyAmXwRLkSZrr3Eb93DdJkdZUSrYCoivwis1G");
    let nftMint2 = new solana.PublicKey("6gVKrnqgithqQCziGkUycBx8GQvKE6CXYongYn2Gzbe7");
    let staker_reward_token_account = await getAtaAccount(mint, staker.publicKey);
    let staker_nft_account = await getAtaAccount(nftMint, staker.publicKey);
    let staker_nft_account2 = await getAtaAccount(nftMint2, staker.publicKey);

    // Add claim ix
    let claim_ix = await bot.getClaimIx(staker, nftMint, staker_reward_token_account);
    tx.add(claim_ix);

    // Add unstake Ix
    let unstake_ix = await bot.getUnstakeIx(staker, nftMint, staker_nft_account);
    let unstake_ix2 = await bot.getUnstakeIx(staker, nftMint2, staker_nft_account2);
    tx.add(unstake_ix);
    tx.add(unstake_ix2)

    let wallet = provider.wallet;
    tx.feePayer = wallet.publicKey
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash
    const signedTx = await wallet.signTransaction(tx);
    const txId = await provider.connection.sendRawTransaction(signedTx.serialize())
    await provider.connection.confirmTransaction(txId)

    console.log(txId)
  }
  
  main().catch(error => console.log(error));