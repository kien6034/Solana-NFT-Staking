import * as anchor from "@project-serum/anchor";
import { Program, workspace } from "@project-serum/anchor";
import {createMintToken, createMintNft, createUserAndAssociatedWallet, transferToken,getSplBalance, getAccountInfo} from "../scripts/utils/token";
import * as spl from '@solana/spl-token';
import * as assert from "assert";
import {Bot} from "../scripts/bot/bot";


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getTimestampInSeconds () {
  return Math.floor(Date.now() / 1000)
}

const STAKE_DELAY1 = -5; // 10 secs
const REWARD_PER_TOKEN_PER_SECOND1 = 1;

const STAKE_DELAY2 = -5; // 10 secs
const REWARD_PER_TOKEN_PER_SECOND2 = 1;

const LOCK_DURATION1 = new anchor.BN(2);
const LOCK_DURATION2 = new anchor.BN(5);;

const REWARD_FUND = 1000000;


describe("nft_staking_unit_test", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  let authorizer: anchor.web3.Keypair;
  let authorizer_reward_wallet: anchor.web3.PublicKey;

  
  let alice: anchor.web3.Keypair;
  let alice_reward_wallet: anchor.web3.PublicKey;

  let reward_token_mint = null;

  let nft1: anchor.web3.PublicKey;
  let alice_nft1_account: anchor.web3.PublicKey;

  let nft2: anchor.web3.PublicKey;
  let alice_nft2_account: anchor.web3.PublicKey;

  let pool1: Bot;
  let pool2: Bot;
  const INTERNAL_ID1 = "p1";
  const INTERNAL_ID2 = "p2";

  it("Setup walelts", async()=>{
    reward_token_mint = await createMintToken(provider);
    [authorizer, authorizer_reward_wallet] =await createUserAndAssociatedWallet(provider,reward_token_mint,true, BigInt(10000000));
    [alice, alice_reward_wallet] = await createUserAndAssociatedWallet(provider,reward_token_mint,false); 

    pool1 = new Bot(reward_token_mint, INTERNAL_ID1, provider, authorizer);
    pool2 = new Bot(reward_token_mint, INTERNAL_ID2, provider, authorizer);
  });

  it("Pool1: Init", async()=>{
    let start_time = getTimestampInSeconds() + STAKE_DELAY1; 
    let start_time_bn = new anchor.BN(start_time);
    let end_time_bn = new anchor.BN(0);
    let reward_per_token_per_second =new anchor.BN(REWARD_PER_TOKEN_PER_SECOND1);
    
    await pool1.initialize(reward_per_token_per_second, start_time_bn, end_time_bn, LOCK_DURATION1, null);
    let vaultPDA = await pool1.getVaultPDA();
    await transferToken(provider, authorizer_reward_wallet, vaultPDA.key, authorizer, REWARD_FUND);

    let pool1Info = await pool1.getControllerInfo();
    assert.equal(pool1Info.authorizer.toBase58(), authorizer.publicKey.toBase58(), "Pool: invalid deployer");
  })

  it("Pool2: Init", async()=>{
    let start_time = getTimestampInSeconds() + STAKE_DELAY2; 
    let start_time_bn = new anchor.BN(start_time);
    let end_time_bn = new anchor.BN(0);
    let reward_per_token_per_second =new anchor.BN(REWARD_PER_TOKEN_PER_SECOND2);
    
    await pool2.initialize(reward_per_token_per_second, start_time_bn, end_time_bn, LOCK_DURATION1, null);
    let vaultPDA = await pool2.getVaultPDA();
    await transferToken(provider, authorizer_reward_wallet, vaultPDA.key, authorizer, REWARD_FUND);
  })

  // This feature is not needed in production 
  it("Pool2: Can update pool", async()=>{ 
    await pool2.updateController(null, null, null, null, new anchor.BN(10));
  })

  it("Pool2: authorizer can withdraw", async()=>{
    let vaultPDA = await pool2.getVaultPDA();

    let preBalance = await getSplBalance(pool2.provider, authorizer_reward_wallet);

    // authorizer withdraw
    await pool2.withdrawReward(null);
    let postBalance = await getSplBalance(pool2.provider, authorizer_reward_wallet);

    let vault_post_balance = await getSplBalance(pool2.provider, vaultPDA.key);
    assert.equal(vault_post_balance, 0, "Withdraw: Post balance of the vault after withdraw reward should be 0");
    assert.equal(preBalance + BigInt(REWARD_FUND), postBalance, "Withdraw: Post balance of the vault after withdraw reward should be 0");
  })

  it("Pool2: Not authorizer cannot withdraw reward fund", async()=>{
    // Transfer reward back to the pool
    let vaultPDA = await pool2.getVaultPDA();
    await transferToken(provider, authorizer_reward_wallet, vaultPDA.key, authorizer, REWARD_FUND);
    let vaultBalance = await getSplBalance(pool2.provider, vaultPDA.key);
    assert.equal(vaultBalance, REWARD_FUND, "Withdraw: Vault balance after deposit should increase");

    try {
      await pool2.withdrawReward(alice);
      assert.fail("Should fail since the caller is not the authorizezr");
    }
    catch(error){
      assert.equal(error.error.errorMessage, 'A has one constraint was violated', "Not the correct error msg");
    }
  })

  it("Pool1: Alice open stake controller", async()=>{
    await pool1.initStakeController(alice);
  })

  it("Pool1: Alice  stake nft1", async()=>{
    [nft1, alice_nft1_account] = await createMintNft(provider, alice.publicKey);

    await pool1.stake(alice, nft1, alice_nft1_account);
    let escrow1= await pool1.getEscrowPDA(alice.publicKey, nft1);
    let escrow1Data = await getAccountInfo(provider, escrow1.key);
    let controllerInfo = await pool1.getControllerInfo();
    let stakeControllerInfo = await pool1.getStakeControllerInfo(alice.publicKey);
    let stakeInfo = await pool1.getStakeInfo(alice.publicKey, nft1);
    
    assert.equal(escrow1Data.amount, 1, "Escrow: Escrow not hold nft");
    assert.equal(controllerInfo.totalAmountStaked, 1, "Controller: total amount staked not valid");
    assert.equal(controllerInfo.totalUserStaked, 1, "Controller: total user staked not valid");
    assert.equal(stakeControllerInfo.totalNftStaked, 1, "Stake Controller: total stake nft");
    assert.equal(stakeInfo.mintOfNft.toBase58(), nft1.toBase58(), "Stake info: Correct nft staked");

  })


  it("Pool1: Alice claim reward of nft 1", async()=>{
    let stake_time = 2;
    await sleep(stake_time * 1000);
    await pool1.claim(alice, nft1, alice_reward_wallet);

    let post_balance = await getSplBalance(pool1.provider, alice_reward_wallet);

    let stakeInfo = await pool1.getStakeInfo(alice.publicKey, nft1);
    let controllerInfo = await pool1.getControllerInfo();
    let stakeControllerInfo = await pool1.getStakeControllerInfo(alice.publicKey);

    let expected_reward = stake_time * controllerInfo.rewardPerTokenPerSecond.toNumber();
    
    assert.ok(controllerInfo.totalRewardClaimed >= expected_reward && controllerInfo.totalRewardClaimed <= expected_reward + 1, "Controller: Reward claimed not valid");
    assert.ok(stakeControllerInfo.totalRewardClaimed >= expected_reward && stakeControllerInfo.totalRewardClaimed <= expected_reward + 1, "Stake Controller: Reward claimed not valid");
    assert.ok(stakeInfo.claimedReward>= expected_reward && stakeInfo.claimedReward<= expected_reward + 1,"Stake Info: Reward claimed not valid" );
    assert.ok(post_balance >= expected_reward &&post_balance<= expected_reward + 1,"Stake Info: Actual reward received not valid");
  })

  it("Pool1: Alice unstake", async()=>{
    let escrowPDA = await pool1.getEscrowPDA(alice.publicKey, nft1);
    let stakeInfoPDA = await pool1.getStakePDA(alice.publicKey, nft1);


    let alice_info= await provider.connection.getAccountInfo(alice.publicKey);
    let stake_info_account_info = await provider.connection.getAccountInfo(stakeInfoPDA.key)
    let escrow_account_info = await provider.connection.getAccountInfo(escrowPDA.key)

    let pre_alice_balance = alice_info.lamports;
    let pre_stake_lamport_balance = stake_info_account_info.lamports;
    let pre_escrow_lamport_balance = escrow_account_info.lamports;
   
    await pool1.unstake(alice, nft1, alice_nft1_account);

    alice_info= await provider.connection.getAccountInfo(alice.publicKey);
    stake_info_account_info = await provider.connection.getAccountInfo(stakeInfoPDA.key)
    escrow_account_info = await provider.connection.getAccountInfo(escrowPDA.key)
    
    assert.equal(stake_info_account_info, null, "Stake Info: The account should have been deleted");
    assert.equal(escrow_account_info, null, "Escrow Info: The account should have been deleted");
    assert.ok(alice_info.lamports >= (pre_alice_balance + pre_stake_lamport_balance + pre_escrow_lamport_balance) * 0.99, "Lamport: fund has been transfered back to the staker")
  })
});