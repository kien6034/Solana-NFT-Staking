
use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Transfer, CloseAccount};
use crate::state::{Controller, StakeInfo, StakeController};
use crate::errors::UnstakeError;

use crate::{STAKE_PDA_SEED, STAKE_CONTROLLER_PDA_SEED};

pub fn unstake(
    ctx: Context<Unstake>,
) -> Result<()> {
    //**** Transfer nft to the staker --> Transfer reward to the staker  ---> Remove the escrow + stake info account */
    let staker = &ctx.accounts.staker;
    let stake_info = &ctx.accounts.stake_info;
    let escrow = &mut ctx.accounts.escrow;
    let staker_nft_account =  &ctx.accounts.staker_nft_account;
    let token_program = &ctx.accounts.token_program;
    let controller = &mut ctx.accounts.controller;
    let stake_controller = &mut ctx.accounts.stake_controller;
    
    //** ******** Update data  ********* */
    controller.total_amount_staked -=1;
    stake_controller.total_nft_staked -= 1;

    if stake_controller.total_nft_staked == 0 {
        controller.total_user_staked -=1;
    }

    //** ******** TRANSFER nft back to the owner wallet  ********* */
    let bump_vector = stake_controller.bump.to_le_bytes();
    let inner = vec![
        STAKE_CONTROLLER_PDA_SEED.as_ref(),
        controller.to_account_info().key.as_ref(), 
        staker.key.as_ref(),
        bump_vector.as_ref()
    ];
    let outer = vec![inner.as_slice()];

    let transfer_ix = Transfer {
        from: escrow.to_account_info(),
        to: staker_nft_account.to_account_info(),
        authority: stake_controller.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        transfer_ix,
        outer.as_slice()
    );
    anchor_spl::token::transfer(cpi_ctx, 1)?;

    //** ******** Close the escrow account ********* */
    let ca =  CloseAccount{
        account: escrow.to_account_info(),
        destination: staker.to_account_info(),
        authority: stake_controller.to_account_info()
    };
    let cpi_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        ca,
        outer.as_slice(),
    );
    anchor_spl::token::close_account(cpi_ctx)?;


    //** ******** Return the lamport of the stake infor to the staker  ********* */
    **staker.try_borrow_mut_lamports()? = staker
            .lamports()
        .checked_add(stake_info.to_account_info().lamports())
            .ok_or(UnstakeError::ReturnLamportError)?;
    **stake_info.to_account_info().try_borrow_mut_lamports()? = 0;
    

    msg!("action: unstake");
    msg!("staker: {}", &ctx.accounts.staker.to_account_info().key);
    msg!("controller: {}", controller.to_account_info().key);
    msg!("mint_of_nft:{}", stake_info.mint_of_nft.key());
    msg!("unstake: {}", stake_info.stake_time);

    Ok(())
}


#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub staker: Signer<'info>,

    #[account(mut)]
    pub controller: Account<'info, Controller>,

    #[account(
        mut,
        seeds = [STAKE_CONTROLLER_PDA_SEED, controller.key().as_ref(), staker.key.as_ref()], bump= stake_controller.bump,
    )]
    pub stake_controller: Account<'info, StakeController>,

    #[account(
       mut,
       seeds = [STAKE_PDA_SEED, controller.key().as_ref(), staker.key.as_ref(), stake_info.mint_of_nft.key().as_ref()], bump= stake_info.bump,
    )]
    pub stake_info: Account<'info, StakeInfo>,

    
    #[account(
       mut
    )]
    pub escrow: Account<'info, TokenAccount>,

    #[account(mut)]
    pub staker_nft_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}


