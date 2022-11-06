use anchor_lang::{prelude::*};
use anchor_spl::token::{self, Mint, TokenAccount, Transfer};
use crate::state::{Controller, StakeInfo, StakeController};
use crate::errors::{ControllerError, StakeError};
use mpl_token_metadata::state::{Metadata};
use mpl_token_metadata::ID as MPL_ID;


use crate::{STAKE_PDA_SEED, ESCROW_PDA_SEED, STAKE_CONTROLLER_PDA_SEED};
use std::str;

pub fn stake(
    ctx: Context<Stake>,
    internal_id: String,
) -> Result<()> {
    let staker = & ctx.accounts.staker;
    let controller = &mut ctx.accounts.controller;
    let stake_info = &mut ctx.accounts.stake_info;
    let mint_of_nft = &ctx.accounts.mint_of_nft;
    let stake_controller = &mut ctx.accounts.stake_controller;
    let metadata_account = &ctx.accounts.metadata;

    //** ******** CHECK the constrain  ********* */
    require_eq!(controller.check_stake_time(), true, ControllerError::NotInStakeTime);
    require!(controller.total_amount_staked < controller.max_stake_amount, StakeError::StakeAmountExceeded);
    
    // ******** CHECK NFT from CORRECT COLLECTION  ********* */
    if controller.collection != None {
        require_eq!(metadata_account.to_account_info().owner, &MPL_ID, StakeError::InvalidMetadataAccount);
        let metadata:Metadata = Metadata::deserialize(&mut &metadata_account.data.borrow()[..])?;
        let collection = metadata.collection;
        match collection {
            None => return Err(StakeError::NotACollectible.into()),
            Some(collection_data) => {
                if collection_data.verified == false {
                    return Err(StakeError::Unverified.into())
                }

                if collection_data.key != controller.collection.unwrap() {
                    return Err(StakeError::InvalidCollection.into())
                }
            }
        }
    }

    //** ******** UPDATE stake_controller  ********* */
    stake_controller.total_nft_staked += 1;


    //** ******** UPDATE Stake_info  ********* */
    stake_info.mint_of_nft = mint_of_nft.key();
    let now_ts = Clock::get().unwrap().unix_timestamp;
    stake_info.stake_time = now_ts;
    stake_info.claimed_reward = 0;
    stake_info.reward_debt = controller.get_full_stake_reward();

    stake_info.bump = *ctx.bumps.get(str::from_utf8(STAKE_PDA_SEED).unwrap()).unwrap();

    //** ******** UPDATE Controller  ********* */
    if stake_controller.total_nft_staked == 1 {
        controller.total_user_staked += 1;
    }
    controller.total_amount_staked += 1;

    //** ******** TRANSFER NFT TO THE ESCROW ********* */
    token::transfer(
        ctx.accounts.into_transfer_to_pda_context(),
        1
    )?;

    msg!("action: stake");
    msg!("internal_id: {}", internal_id);
    msg!("staker: {}", staker.to_account_info().key);
    msg!("controller: {}", &ctx.accounts.controller.to_account_info().key);
    msg!("mint_of_nft: {}", mint_of_nft.to_account_info().key);
    msg!("stake_time: {}", now_ts);
    
    Ok(())
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub staker: Signer<'info>,

    #[account(mut)]
    pub controller: Account<'info, Controller>,
    pub mint_of_nft: Account<'info, Mint>,

    /// CHECK: metadata of nft, read only 
    #[account()]
    metadata: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [STAKE_CONTROLLER_PDA_SEED, controller.key().as_ref(), staker.key.as_ref()], bump= stake_controller.bump,
    )]
    pub stake_controller: Account<'info, StakeController>,

    #[account(
        init, 
        space = StakeInfo::LEN,
        payer = staker,
        seeds = [STAKE_PDA_SEED, controller.key().as_ref(), staker.key.as_ref(), mint_of_nft.key().as_ref()],
        bump
    )]
    pub stake_info: Account<'info, StakeInfo>,

    #[account(
        init_if_needed, 
        payer=staker,
        seeds= [ESCROW_PDA_SEED, controller.key().as_ref(), staker.key.as_ref(), mint_of_nft.key().as_ref()],
        bump,
        token::mint=mint_of_nft,
        token::authority=stake_controller,
    )]
    pub escrow: Account<'info, TokenAccount>,

    #[account(mut)]
    pub staker_nft_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}


impl<'info> Stake<'info> {
    fn into_transfer_to_pda_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self
                .staker_nft_account
                .to_account_info()
                .clone(),
            to: self.escrow.to_account_info().clone(),
            authority: self.staker.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}
