
use anchor_lang::prelude::*;
use anchor_spl::token::{ Mint, TokenAccount};
use crate::state::Controller;
use crate::errors::{InitializeError};
use std::str;

use crate::{CONTROLLER_PDA_SEED, VAULT_PDA_SEED};

pub fn initialize(
    ctx: Context<Initialize>,
    internal_id: String,
    collection: Option<Pubkey>,
    reward_per_token_per_second: u64,
    start_time: i64,
    end_time: i64,
    lock_duration: i64,
    max_stake_amount: u64
) -> Result<()> {
    //********** CONSTRAIN  ********* */
    require_neq!(start_time, 0, InitializeError::StartTimeNotValid);
    require!(end_time == 0 || end_time >start_time, InitializeError::EndTimeGreaterThanStartTime);

    let initializer = &ctx.accounts.initializer;
    let controller = &mut ctx.accounts.controller;

    match collection {
        Some(addr) => controller.collection = Some(addr),
        None => controller.collection = None
    };

    controller.bump = *ctx.bumps.get(str::from_utf8(CONTROLLER_PDA_SEED).unwrap()).unwrap();
    controller.vault_bump = *ctx.bumps.get(str::from_utf8(VAULT_PDA_SEED).unwrap()).unwrap();
    controller.authorizer = initializer.key();
    controller.reward_per_token_per_second = reward_per_token_per_second;
    controller.start_time = start_time;
    controller.last_update_time = start_time;
    controller.end_time =  end_time;
    controller.accumulated_debt = 0;
    controller.internal_id = internal_id.clone();
    controller.lock_duration = lock_duration;
    controller.max_stake_amount = max_stake_amount;
 
    // logging 
    msg!("action: create_staking_pool");
    msg!("internal_id: {}", internal_id);
    msg!("authorizer: {}", initializer.to_account_info().key);
    msg!("mint_of_reward_token: {}", &ctx.accounts.mint_of_reward_token.to_account_info().key);
    msg!("controller: {}", controller.to_account_info().key);
    msg!("vault: {}", &ctx.accounts.vault.to_account_info().key);
    Ok(())
}

#[derive(Accounts)]
#[instruction(internal_id: String)]

pub struct Initialize<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub mint_of_reward_token: Account<'info, Mint>,

    #[account(
        init, 
        payer=initializer,
        seeds=[VAULT_PDA_SEED.as_ref(), mint_of_reward_token.key().as_ref(), internal_id.as_ref()],
        bump,
        token::mint=mint_of_reward_token,
        token::authority=controller,
    )]
    pub vault: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer=initializer, 
        space = Controller::LEN,
        seeds = [CONTROLLER_PDA_SEED.as_ref(), mint_of_reward_token.key().as_ref(), internal_id.as_ref()],
        bump
    )]
    pub controller: Account<'info, Controller>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}