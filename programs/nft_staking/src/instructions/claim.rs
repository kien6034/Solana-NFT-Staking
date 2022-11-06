use anchor_lang::prelude::*;
use anchor_spl::token::{Mint,TokenAccount, Transfer};
use crate::state::{Controller, StakeInfo, StakeController};
use crate::errors::ClaimError;

use crate::{CONTROLLER_PDA_SEED, STAKE_PDA_SEED, STAKE_CONTROLLER_PDA_SEED};

pub fn claim(
    ctx: Context<Claim>,
    internal_id: String
) -> Result<()> {
    let stake_info = &mut ctx.accounts.stake_info;
    let controller = &mut ctx.accounts.controller;
    let vault = &mut ctx.accounts.vault;
    let staker_reward_token_account = &mut ctx.accounts.staker_reward_token_account;
    let token_program = &ctx.accounts.token_program;
    let stake_controller = &mut ctx.accounts.stake_controller;
    let mint_of_reward_token = &mut ctx.accounts.mint_of_reward_token;

    //********** Calculate reward amount and update data  ********* */
    let pending_reward = stake_info.get_pending_reward(controller);

    if vault.amount == 0 {
        msg!("action: claim");
        msg!("internal_id: {}", internal_id);
        msg!("staker: {}", &ctx.accounts.staker.to_account_info().key);
        msg!("controller: {}", &ctx.accounts.controller.to_account_info().key);
        msg!("stake_info: {}", &ctx.accounts.stake_info.to_account_info().key);
        msg!("mint_of_nft: {}", &ctx.accounts.stake_info.mint_of_nft.key());
        msg!("stake_time: {}", &ctx.accounts.stake_info.stake_time);
        msg!("reward_amount: {}", 0);
        msg!("note: pool out of reward");
        return Ok(())
    }

    require!(pending_reward <= vault.amount, ClaimError::InsufficentRewardFund);

    stake_info.claimed_reward += pending_reward;
    controller.total_reward_claimed += pending_reward;
    stake_controller.total_reward_claimed += pending_reward;   

    //********** Transfer the reward amount to the staker  ********* */
    let bump_vector = controller.bump.to_le_bytes();

    let inner = vec![
        CONTROLLER_PDA_SEED.as_ref(),
        mint_of_reward_token.to_account_info().key.as_ref(),
        controller.internal_id.as_ref(), 
        bump_vector.as_ref()
    ];
    let outer = vec![inner.as_slice()];

    let transfer_ix = Transfer {
        from: vault.to_account_info(),
        to: staker_reward_token_account.to_account_info(),
        authority: controller.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        transfer_ix,
        outer.as_slice()
    );
    anchor_spl::token::transfer(cpi_ctx, pending_reward)?;

    msg!("action: claim");
    msg!("internal_id: {}", internal_id);
    msg!("staker: {}", &ctx.accounts.staker.to_account_info().key);
    msg!("controller: {}", &ctx.accounts.controller.to_account_info().key);
    msg!("stake_info: {}", &ctx.accounts.stake_info.to_account_info().key);
    msg!("mint_of_nft: {}", &ctx.accounts.stake_info.mint_of_nft.key());
    msg!("stake_time: {}", &ctx.accounts.stake_info.stake_time);
    msg!("reward_amount: {}", pending_reward);
    Ok(())
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub staker: Signer<'info>,
    
    #[account(mut)]
    pub controller: Account<'info, Controller>,

    #[account(
        mut,
        seeds = [STAKE_CONTROLLER_PDA_SEED, controller.key().as_ref(), staker.key.as_ref()], bump= stake_controller.bump,
    )]
    pub stake_controller: Account<'info, StakeController>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    pub mint_of_reward_token: Account<'info, Mint>,
    
    #[account(
       mut,
       seeds = [STAKE_PDA_SEED, controller.key().as_ref(), staker.key.as_ref(), stake_info.mint_of_nft.key().as_ref()], bump= stake_info.bump,
    )]
    
    pub stake_info: Account<'info, StakeInfo>,
    #[account(
        init_if_needed,
        payer = staker,
        associated_token::mint = mint_of_reward_token,
        associated_token::authority = staker,
    )]
    pub staker_reward_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub associated_token_program: AccountInfo<'info>,
}


