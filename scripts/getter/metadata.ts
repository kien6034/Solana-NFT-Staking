const {Bot} = require("../bot/bot");
import * as solana from "@solana/web3.js";
import * as spl from '@solana/spl-token';
import * as anchor from "@project-serum/anchor";
import  {getTokenMetadata} from "../utils/pda";

const fs = require("fs");


const main= async()=>{
    const mint = new solana.PublicKey("35a69sNeWqtnVsujK2Kdq3LbQXTYwEtiHcp86umK8nmJ");
    let tokenMetadata = await getTokenMetadata(mint);
    console.log(tokenMetadata.key.toBase58());
}
  
  main().catch(error => console.log(error));