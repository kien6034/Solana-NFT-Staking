
use anchor_lang::prelude::*;
use crate::state::Controller;
use anchor_spl::token::{Mint, TokenAccount, Transfer};
use crate::{CONTROLLER_PDA_SEED, VAULT_PDA_SEED};

pub fn withdraw_reward(
    ctx: Context<WithdrawReward>,
) -> Result<()> {
    let controller = &mut ctx.accounts.controller;
    let mint_of_reward_token = &mut ctx.accounts.mint_of_reward_token;
    let authorizer_reward_token_account = &mut ctx.accounts.authorizer_reward_token_account;
    let vault = &mut ctx.accounts.vault;
    let token_program = &ctx.accounts.token_program;

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
        to: authorizer_reward_token_account.to_account_info(),
        authority: controller.to_account_info(),
    };

    let amount = vault.amount;
    let cpi_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        transfer_ix,
        outer.as_slice()
    );
    anchor_spl::token::transfer(cpi_ctx, amount)?;

    msg!("action: withdraw reward");
    msg!("authorizer: {}", controller.authorizer.key());
    msg!("mint_of_reward_token: {}", mint_of_reward_token.key());
    msg!("vault: {}", vault.key());
    msg!("authorizer_reward_token_account: {}", authorizer_reward_token_account.key());
    msg!("amount: {}", amount);
    Ok(())
}

#[derive(Accounts)]

pub struct WithdrawReward<'info> {
    #[account(mut)]
    pub authorizer: Signer<'info>,
    
    pub mint_of_reward_token: Account<'info, Mint>,
    
    #[account(
        seeds=[CONTROLLER_PDA_SEED.as_ref(), mint_of_reward_token.key().as_ref(), controller.internal_id.as_ref()],
        bump=controller.bump,
        has_one = authorizer
    )]
    pub controller: Account<'info, Controller>,

    #[account(
        mut,
        seeds=[VAULT_PDA_SEED.as_ref(), mint_of_reward_token.key().as_ref(), controller.internal_id.as_ref()],
        bump=controller.vault_bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = authorizer,
        associated_token::mint = mint_of_reward_token,
        associated_token::authority = authorizer,
    )]
    pub authorizer_reward_token_account: Account<'info, TokenAccount>,
 
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub associated_token_program: AccountInfo<'info>,
}
