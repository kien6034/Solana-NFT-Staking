
use anchor_lang::{prelude::*};
use crate::state::{Controller, StakeController};


use crate::{STAKE_CONTROLLER_PDA_SEED};
use std::str;

pub fn init_stake_contrller(
    ctx: Context<InitStakeController>,
) -> Result<()> {
   
    let stake_controller = & mut ctx.accounts.stake_controller;

    stake_controller.total_nft_staked = 0;
    stake_controller.total_reward_claimed = 0;
    stake_controller.bump = *ctx.bumps.get(str::from_utf8(STAKE_CONTROLLER_PDA_SEED).unwrap()).unwrap();

    msg!("action: init_stake_controller");
    msg!("staker: {}", &ctx.accounts.staker.to_account_info().key);
    msg!("controller: {}", &ctx.accounts.controller.to_account_info().key);
    msg!("stake_controller: {}", stake_controller.to_account_info().key);
    Ok(())
}

#[derive(Accounts)]
pub struct InitStakeController<'info> {
    #[account(mut)]
    pub staker: Signer<'info>,

    #[account(mut)]
    pub controller: Account<'info, Controller>,
   
    #[account(
        init, 
        space = StakeController::LEN,
        payer = staker,
        seeds = [STAKE_CONTROLLER_PDA_SEED, controller.key().as_ref(), staker.key.as_ref()],
        bump
    )]
    pub stake_controller: Account<'info, StakeController>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}


