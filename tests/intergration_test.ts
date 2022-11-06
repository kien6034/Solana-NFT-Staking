// import * as anchor from "@project-serum/anchor";
// import { Program } from "@project-serum/anchor";
// import { NftStaking } from "../target/types/nft_staking";
// import { Connection, PublicKey, Transaction } from '@solana/web3.js';
// import {getAccount, createMint, createAccount, mintTo, getOrCreateAssociatedTokenAccount, transfer} from "@solana/spl-token";
// import {getControllerPDA, getVaultPDA, getStakePDA, getEscrowPDA} from "../scripts/utils/pda";
// import {createMintToken, createMintNft, createUserAndAssociatedWallet, transferToken, getSplBalance} from "../scripts/utils/token";
// import * as spl from '@solana/spl-token';
// import {Bot} from "../scripts/bot/bot";
// import * as assert from "assert";


// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// function getTimestampInSeconds () {
//   return Math.floor(Date.now() / 1000)
// }

// const STAKE_DELAY1 = -5; // 10 secs
// const REWARD_PER_TOKEN_PER_SECOND1 = 1;

// const STAKE_DELAY2 = -5; // 10 secs
// const REWARD_PER_TOKEN_PER_SECOND2 = 1;


// describe("nft_staking_intergration_test", () => {
//   // Configure the client to use the local cluster.
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);

//   let authorizer: anchor.web3.Keypair;
//   let authorizer_reward_wallet: anchor.web3.PublicKey;

  
//   let alice: anchor.web3.Keypair;
//   let alice_reward_wallet: anchor.web3.PublicKey;

//   let reward_token_mint = null;

//   let nft1: anchor.web3.PublicKey;
//   let alice_nft1_account: anchor.web3.PublicKey;

//   let nft2: anchor.web3.PublicKey;
//   let alice_nft2_account: anchor.web3.PublicKey;


//   let pool1: Bot;
//   let pool2: Bot;

//   const INTERNAL_ID1 = "p1";
//   const INTERNAL_ID2 = "p2";

//   const LOCK_DURATION1 = new anchor.BN(3); 
//   const LOCK_DURATION2 = new anchor.BN(5); 

//   /**
//    * @dev Mocking the wallets. In productions, those corresponding accounts should have already been created
//    */
//   it("Setup walelts", async()=>{
//     reward_token_mint = await createMintToken(provider);
//     [authorizer, authorizer_reward_wallet] =await createUserAndAssociatedWallet(provider,reward_token_mint,true, BigInt(10000000));
//     [alice, alice_reward_wallet] = await createUserAndAssociatedWallet(provider,reward_token_mint,false); 

//     pool1 = new Bot(reward_token_mint, INTERNAL_ID1, provider, authorizer);
//     pool2 = new Bot(reward_token_mint, INTERNAL_ID2, provider, authorizer);
    
//   });

//   it("Pool1: Init - Lockduration: LOCK_DURATION1 ", async()=>{
//     let start_time = getTimestampInSeconds() + STAKE_DELAY1; 
//     let start_time_bn = new anchor.BN(start_time);
//     let end_time_bn = new anchor.BN(0);
//     let reward_per_token_per_second =new anchor.BN(REWARD_PER_TOKEN_PER_SECOND1);

//     await pool1.initialize(reward_per_token_per_second, start_time_bn, end_time_bn, LOCK_DURATION1, null);


//     // Transfer reward token to the contract --> for user to claim 
//     let vaultPDA = await pool1.getVaultPDA();
//     await transferToken(provider, authorizer_reward_wallet, vaultPDA.key, authorizer, 1000000);
//   })

//   /**
//    * @dev Initialize method, which is used to create the staking pool.
//    */
//   it("Pool2: Init: Lockduration: LOCK_DURATION2", async()=>{
//     let start_time = getTimestampInSeconds() + STAKE_DELAY2; 
//     let start_time_bn = new anchor.BN(start_time);
//     let end_time_bn = new anchor.BN(0);
//     let reward_per_token_per_second =new anchor.BN(REWARD_PER_TOKEN_PER_SECOND2);
    
//     let tx = new Transaction();
//     let ix = await pool2.getInitializeIx(alice.publicKey, reward_per_token_per_second, start_time_bn, end_time_bn, LOCK_DURATION2, null);
//     tx.add(ix);

//     let wallet = new anchor.Wallet(alice);
//     tx.feePayer = wallet.publicKey;
//     tx.recentBlockhash = (await pool2.provider.connection.getLatestBlockhash()).blockhash;
//     const signedTx = await wallet.signTransaction(tx);
//     const txId = await pool2.provider.connection.sendRawTransaction(signedTx.serialize());
//     await pool2.provider.connection.confirmTransaction(txId);
//   })


//   it("Pool1: Alice stake nft1 and nft2 at the same time ", async()=>{
//     let tx = new Transaction();
     
//     /**
//      * @notice This check if the STAKECONTROLLER account corresponding to a user and a CONTROLLER account has been already created.
//      *  If not, add the create STAKECONTROLLER account instruction 
//      */
//     try {
//         let stakeControllerInfo = await pool1.getStakeControllerInfo(alice.publicKey);
//     }catch{
//         //if stake controller not created ===> create ix to gen stake controller first 
//         let ix = await pool1.getInitStakeControllerIx(alice);
//         tx.add(ix);
//     }

//     /**
//      * @notice In production, nft1 and alice_nft1_account are already existed in the user wallet.
//      *  Alice_nft1_account is the associated wallet address of the nft1 mint
//      */
//     [nft1, alice_nft1_account] = await createMintNft(provider, alice.publicKey);
//     [nft2, alice_nft2_account] = await createMintNft(provider, alice.publicKey);
    
//     let stakeIx1 = await pool1.getStakeIx(alice, nft1, alice_nft1_account);
//     let stakeIx2 = await pool1.getStakeIx(alice, nft2, alice_nft2_account);
//     tx.add(stakeIx1)
//     tx.add(stakeIx2)
//     let wallet = new anchor.Wallet(alice);
   
//     tx.feePayer = wallet.publicKey;
//     tx.recentBlockhash = (await pool1.provider.connection.getLatestBlockhash()).blockhash;
//     const signedTx = await wallet.signTransaction(tx);
//     const txId = await pool1.provider.connection.sendRawTransaction(signedTx.serialize());

//     let balance = await getSplBalance(pool1.provider, alice_nft2_account);
//     console.log(balance)
//   })

//     /**
//      * @dev Normal flow, alice claim reward of her nft1's staking 
//      */
//   it("Pool1: Alice claim reward of nft1 after LOCK_DURATION secs", async()=>{
//     /**
//      * @dev Alice wait for LOCK_DURATION1 second and claim reward of NFT1 
//      * Alice will get her reward  
//      */
    
//     await sleep(LOCK_DURATION1.toNumber() * 1000);
//     let tx= new Transaction();
//     let claimIx =  await pool1.getClaimIx(alice, nft1, alice_reward_wallet);
//     tx.add(claimIx);
//     let wallet = new anchor.Wallet(alice);

//     tx.feePayer = wallet.publicKey;
//     tx.recentBlockhash = (await pool1.provider.connection.getLatestBlockhash()).blockhash;
//     const signedTx = await wallet.signTransaction(tx);
//     const txId = await pool1.provider.connection.sendRawTransaction(signedTx.serialize());
//     await pool1.provider.connection.confirmTransaction(txId);

//     // Get the stake info
//     let stakeInfo = await pool1.getStakeInfo(alice.publicKey, nft1);
//     let expected_reward = LOCK_DURATION1.toNumber() * REWARD_PER_TOKEN_PER_SECOND1;
//     //assert.ok(stakeInfo.claimedReward >= expected_reward && stakeInfo.claimedReward <= expected_reward + 1, "Claim: incorrect reward value");
//     console.log(stakeInfo)  
//   })

  
//   /**
//    * @dev When unstake, alice transaction will contain two instructions: Claim the pending reward, and the unstake
//    */
//   it("Pool1: Alice unstake nft2 and claim the reward", async()=>{
//     let tx= new Transaction();
//     let claimIx =  await pool1.getClaimIx(alice, nft1, alice_reward_wallet);
//     let unstakeIx = await pool1.getUnstakeIx(alice, nft1, alice_nft1_account);

//     tx.add(claimIx);
//     tx.add(unstakeIx);
//     let wallet = new anchor.Wallet(alice);

//     tx.feePayer = wallet.publicKey;
//     tx.recentBlockhash = (await pool1.provider.connection.getLatestBlockhash()).blockhash;
//     const signedTx = await wallet.signTransaction(tx);
//     const txId = await pool1.provider.connection.sendRawTransaction(signedTx.serialize());
//     await pool1.provider.connection.confirmTransaction(txId);


//     /**
//      * @notice The reward of alice when unstake nft 2 should be zero, since she has just staked for 3 secs, while the lock duration is 5 secs
//      */
//     // Get the stake info
//     let stakeInfo = await pool1.getStakeInfo(alice.publicKey, nft2);
//     //console.log(stakeInfo)
//   })

//   it("Pool1: Alice claim reward of nft1 and unstake after 3 more secs", async()=>{
//     /**
//      * @dev Alice wait for LOCK_DURATION1 second and claim reward of NFT1 
//      * Alice will get her reward  
//      */
    
//     await sleep(4 * 1000);
//     let tx= new Transaction();
//     let claimIx =  await pool1.getClaimIx(alice, nft1, alice_reward_wallet);
//     let unstakeIx = await pool1.getUnstakeIx(alice, nft1, alice_nft1_account);
//     tx.add(claimIx);
//     tx.add(unstakeIx);
//     let wallet = new anchor.Wallet(alice);

//     tx.feePayer = wallet.publicKey;
//     tx.recentBlockhash = (await pool1.provider.connection.getLatestBlockhash()).blockhash;
//     const signedTx = await wallet.signTransaction(tx);
//     const txId = await pool1.provider.connection.sendRawTransaction(signedTx.serialize());
//     await pool1.provider.connection.confirmTransaction(txId);

//     // Get the stake info
//     let stakeInfo = await pool1.getStakeInfo(alice.publicKey, nft1);
//     console.log(stakeInfo)
//   })
// });



