import {getDeployer, getProvider} from "../utils/provider";
import * as solana from "@solana/web3.js";
import { ConfirmOptions } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import * as spl from '@solana/spl-token';
import {getControllerPDA, getVaultPDA, getStakePDA, getEscrowPDA, getStakeControllerPDA, getTokenMetadata, getAtaAccount} from "../utils/pda";
import {Controller} from "../types/types"

interface PDAParam {
    key: anchor.web3.PublicKey,
    bump: number
}

const FAKE_INTERNAL_ID = "fake_internal_id";

export class Bot{
    deployer: solana.Keypair;
    provider: anchor.AnchorProvider;
    program: anchor.Program;
    mint: anchor.web3.PublicKey;
    internalId: string

    constructor(mint: anchor.web3.PublicKey, internalId: string, provider?: anchor.AnchorProvider, deployer?: anchor.web3.Keypair){
      //local net  
      if (provider){
        this.provider = provider;

        if (!deployer){
          console.log("----------- Require custom deployer for testing -----------");
          process.exit(1);
        }
        this.deployer= deployer;
      }
      
      //devnet or mainnet
      else{
        this.deployer = getDeployer();
        this.provider = getProvider(this.deployer);
      }
    
      anchor.setProvider(this.provider);
      this.program = anchor.workspace.NftStaking;
      this.mint = mint;
      this.internalId = internalId;
    }

    getAtaAccount = async(user: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> =>{
      return await spl.getAssociatedTokenAddress(this.mint, user);
    }

    getControllerPDA = async() : Promise<PDAParam> =>{
      return await getControllerPDA(this.program, this.mint, this.internalId);
    }

    getVaultPDA = async(): Promise<PDAParam> => {
      return await getVaultPDA(this.program, this.mint, this.internalId);
    }
    
    getStakePDA = async(staker: anchor.web3.PublicKey, nftMint: anchor.web3.PublicKey): Promise<PDAParam> =>{
      let controllerPDA = await this.getControllerPDA();
       return await getStakePDA(this.program, controllerPDA.key,staker, nftMint);
    }
    
    getEscrowPDA = async(staker: anchor.web3.PublicKey, nftMint: anchor.web3.PublicKey): Promise<PDAParam> => {
        let controllerPDA = await this.getControllerPDA();

        return await getEscrowPDA(this.program, controllerPDA.key, staker, nftMint);
    }

    getStakeControllerPDA = async(staker: anchor.web3.PublicKey): Promise<PDAParam> => {
      let controllerPDA = await this.getControllerPDA();

      return await getStakeControllerPDA(this.program, controllerPDA.key, staker);
    }



    //// ----------------------- SINGLE FUCTIONS ------------------------------
    initialize = async(reward_per_second: anchor.BN, start_time: anchor.BN, end_time: anchor.BN, lock_duration: anchor.BN, max_stake_amount: anchor.BN, collection:  null | anchor.web3.PublicKey) => {
      let controllerPDA= await this.getControllerPDA();
      let vaultPDA = await this.getVaultPDA();
      return await this.program.methods.initialize(this.internalId, collection, reward_per_second, start_time, end_time, lock_duration,max_stake_amount).accounts({
        initializer: this.deployer.publicKey, // vi phantom connected
        mintOfRewardToken: this.mint, // sss token public key  
        vault: vaultPDA.key,  // pda vault public key 
        controller: controllerPDA.key // controller 
      }).signers([this.deployer]).rpc();
    }

    updateController= async(
      collection: null | anchor.web3.PublicKey,
      reward_per_second: null | anchor.BN,
      start_time: null | anchor.BN,
      end_time: null | anchor.BN,
      lock_duration: null | anchor.BN
    )=>{
      let controllerPDA = await this.getControllerPDA();
      
      return await this.program.methods.updateController(collection, reward_per_second, start_time, end_time, lock_duration).accounts({
        authorizer: this.deployer.publicKey,
        controller: controllerPDA.key
      }).signers([this.deployer]).rpc()
    }

    updateAdmin= async(
      idx: number,
      addr: anchor.web3.PublicKey
    )=>{
      let controllerPDA = await this.getControllerPDA();
      
      return await this.program.methods.updateAdmin(idx, addr).accounts({
        authorizer: this.deployer.publicKey,
        controller: controllerPDA.key
      }).signers([this.deployer]).rpc()
    }
    

    withdrawReward = async(caller: null | anchor.web3.Keypair)=>{
      if (caller == null){
        caller = this.deployer;
      }
      let controllerPDA = await this.getControllerPDA();
      let vaultPDA = await this.getVaultPDA();

      let authorizerTokenAccount = await getAtaAccount(this.mint, caller.publicKey); 
      
      return await this.program.methods.withdrawReward().accounts({
        authorizer: caller.publicKey,
        mintOfRewardToken: this.mint,
        controller: controllerPDA.key,
        vault: vaultPDA.key,
        authorizerRewardTokenAccount: authorizerTokenAccount
      }).signers([caller]).rpc()
    }


    initStakeController = async(staker: anchor.web3.Keypair) => {
      let controllerPDA= await this.getControllerPDA();
      let stakerControllerPDA = await this.getStakeControllerPDA(staker.publicKey);
      
      
      await this.program.methods.initStakeController().accounts({
        staker: staker.publicKey,
        controller: controllerPDA.key,
        stakeController: stakerControllerPDA.key
      }).signers([staker]).rpc();
    }

    stake = async(staker: anchor.web3.Keypair, nftMint: anchor.web3.PublicKey, staker_nft_account: anchor.web3.PublicKey)=>{
      let controllerPDA= await this.getControllerPDA();
      let stakeControllerPDA = await this.getStakeControllerPDA(staker.publicKey);
      let stakePDA = await this.getStakePDA(staker.publicKey, nftMint);
      let escrowPDA = await this.getEscrowPDA(staker.publicKey, nftMint);
      let metadataPDA = await getTokenMetadata(nftMint);
 
      return await this.program.methods.stake(FAKE_INTERNAL_ID).accounts({
          staker: staker.publicKey,
          controller: controllerPDA.key,
          mintOfNft: nftMint,
          metadata: metadataPDA.key,
          stakeController: stakeControllerPDA.key,
          stakeInfo: stakePDA.key,
          escrow: escrowPDA.key,
          stakerNftAccount: staker_nft_account
        }).signers([staker]).rpc();
    }

    claim = async(staker: anchor.web3.Keypair, nftMint: anchor.web3.PublicKey, stakerRewardTokenAccount: anchor.web3.PublicKey)=>{
      let controllerPDA= await this.getControllerPDA();
      let stakeControllerPDA = await this.getStakeControllerPDA(staker.publicKey);
      let vaultPDA = await this.getVaultPDA();
      let stakePDA = await this.getStakePDA(staker.publicKey, nftMint);
      let escrowPDA = await this.getEscrowPDA(staker.publicKey, nftMint);

      return await this.program.methods.claim(FAKE_INTERNAL_ID).accounts({
        staker: staker.publicKey,
        controller: controllerPDA.key,
        stakeController: stakeControllerPDA.key,
        vault: vaultPDA.key,
        mintOfNft: nftMint,
        mintOfRewardToken: this.mint,
        stakeInfo: stakePDA.key,
        stakerRewardTokenAccount: stakerRewardTokenAccount
      }).signers([staker]).rpc();
    } 
    
   
    unstake = async(staker: anchor.web3.Keypair, nftMint: anchor.web3.PublicKey, stakerNftAccount: anchor.web3.PublicKey)=>{
      let controllerPDA= await this.getControllerPDA();
      let stakeControllerPDA = await this.getStakeControllerPDA(staker.publicKey);
      let stakePDA = await this.getStakePDA(staker.publicKey, nftMint);
      let escrowPDA = await this.getEscrowPDA(staker.publicKey, nftMint);
      let nftAta = await getAtaAccount(nftMint, this.deployer.publicKey);

      return await this.program.methods.unstake(FAKE_INTERNAL_ID).accounts({
        staker: staker.publicKey,
        controller: controllerPDA.key,
        stakeController: stakeControllerPDA.key,
        stakeInfo: stakePDA.key,
        escrow: escrowPDA.key,
        
        stakerNftAccount: stakerNftAccount
      }).signers([staker]).rpc();
    }



    //// ----------------------- GET INSTRUCTIONS ------------------------------
    getInitializeIx = async(deployer: anchor.web3.PublicKey,reward_per_second: anchor.BN, start_time: anchor.BN, end_time: anchor.BN, lock_duration: anchor.BN, max_stake_amount: number,  collection:  null | anchor.web3.PublicKey) => {
      let controllerPDA= await this.getControllerPDA();
      let vaultPDA = await this.getVaultPDA();

      let ix = this.program.instruction.initialize(this.internalId, collection, reward_per_second, start_time, end_time, lock_duration, max_stake_amount, collection,{
        accounts: {
          initializer: deployer,
          mintOfRewardToken: this.mint,
          vault: vaultPDA.key,
          controller: controllerPDA.key,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: spl.TOKEN_PROGRAM_ID
        }
        
      })
      return ix;
    }

    getInitStakeControllerIx = async(staker: anchor.web3.Keypair) =>{
      let controllerPDA= await this.getControllerPDA();
      let stakerControllerPDA = await this.getStakeControllerPDA(staker.publicKey);
      let ix = this.program.instruction.initStakeController({
        accounts: {
          staker: staker.publicKey,
          controller: controllerPDA.key,
          stakeController: stakerControllerPDA.key,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY
        }
      })
      return ix;
    }

    getStakeIx = async(staker: anchor.web3.Keypair, nftMint: anchor.web3.PublicKey, stakerNftAccount: anchor.web3.PublicKey) => {
      let controllerPDA= await this.getControllerPDA();
      let stakeControllerPDA = await this.getStakeControllerPDA(staker.publicKey);
      let stakePDA = await this.getStakePDA(staker.publicKey, nftMint);
      let escrowPDA = await this.getEscrowPDA(staker.publicKey, nftMint);
      let metadataPDA = await getTokenMetadata(nftMint);
  
      let ix = this.program.instruction.stake(FAKE_INTERNAL_ID,{
        accounts:{ 
          staker: staker.publicKey,
          controller: controllerPDA.key,
          mintOfNft: nftMint,
          metadata: metadataPDA.key,
          stakeController: stakeControllerPDA.key,
          stakeInfo: stakePDA.key,
          escrow: escrowPDA.key,
          stakerNftAccount: stakerNftAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: spl.TOKEN_PROGRAM_ID
        }
      })

      return ix;
    }

    getClaimIx = async(staker: anchor.web3.Keypair, nftMint: anchor.web3.PublicKey, stakerRewardTokenAccount: anchor.web3.PublicKey)=>{
      let controllerPDA= await this.getControllerPDA();
      let stakeControllerPDA = await this.getStakeControllerPDA(staker.publicKey);
      let vaultPDA = await this.getVaultPDA();
      let stakePDA = await this.getStakePDA(staker.publicKey, nftMint);
      let escrowPDA = await this.getEscrowPDA(staker.publicKey, nftMint);

      let ix= this.program.instruction.claim(FAKE_INTERNAL_ID,{
          accounts: {
            staker: staker.publicKey,
            controller: controllerPDA.key,
            stakeController: stakeControllerPDA.key,
            vault: vaultPDA.key,
            mintOfRewardToken: this.mint,
            stakeInfo: stakePDA.key,
            stakerRewardTokenAccount: stakerRewardTokenAccount,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID
          }
      })
      return ix;
    }

    getUnstakeIx = async(staker: anchor.web3.Keypair, nftMint: anchor.web3.PublicKey, stakerNftAccount: anchor.web3.PublicKey)=>{
      let controllerPDA= await this.getControllerPDA();
      let stakeControllerPDA = await this.getStakeControllerPDA(staker.publicKey);
      let stakePDA = await this.getStakePDA(staker.publicKey, nftMint);
      let escrowPDA = await this.getEscrowPDA(staker.publicKey, nftMint);

      let ix= this.program.instruction.unstake(FAKE_INTERNAL_ID,{
          accounts: {
            staker: staker.publicKey,
            controller: controllerPDA.key,
            stakeController: stakeControllerPDA.key,
            stakeInfo: stakePDA.key,
            escrow: escrowPDA.key,
            stakerNftAccount: stakerNftAccount,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
          }
      })
      return ix;
    }



    ///// ------------------------ GETTERS ----------------------------
  
    getEscrowAccountInfo = async(staker: anchor.web3.PublicKey, nftMint: anchor.web3.PublicKey): Promise<any> => {
      let escrowPDA =  await this.getEscrowPDA(staker, nftMint);
      return await this.provider.connection.getAccountInfo(escrowPDA.key)
    }

    getStakeInfo = async(staker: anchor.web3.PublicKey, nftMint: anchor.web3.PublicKey): Promise<any> => {
      let stakePDA = await this.getStakePDA(staker, nftMint);

      return await this.program.account.stakeInfo.fetch(stakePDA.key);
    }

    getControllerInfo = async() : Promise<any>=>{
      let controllerPDA = await this.getControllerPDA();
      return await this.program.account.controller.fetch(controllerPDA.key);
    }

    getStakeControllerInfo = async(staker: anchor.web3.PublicKey): Promise<any> => {
      let stakeControllerPDA = await this.getStakeControllerPDA(staker);
      return await this.program.account.stakeController.fetch(stakeControllerPDA.key);
    }
}