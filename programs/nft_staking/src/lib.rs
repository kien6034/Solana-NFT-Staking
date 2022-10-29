use anchor_lang::prelude::*;

declare_id!("AvkGefXsDuKULstEBSFW8i32nF4r8MWBUpWZqAzLhgXL");

pub mod state;
pub mod instructions;
pub mod errors;

use instructions::*;

pub const CONTROLLER_PDA_SEED: &[u8] = b"controller";
pub const VAULT_PDA_SEED: &[u8] = b"vault";
pub const STAKE_PDA_SEED: &[u8] = b"stake_info";
pub const ESCROW_PDA_SEED: &[u8] = b"escrow";
pub const STAKE_CONTROLLER_PDA_SEED: &[u8] = b"stake_controller";

#[program]
pub mod nft_staking {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        internal_id: String,
        collection: Option<Pubkey>,
        reward_per_token_per_second: u64,
        start_time: i64,
        end_time: i64,
        lock_duration: i64
    ) -> Result<()> {
        instructions::initialize::initialize(ctx, internal_id, collection, reward_per_token_per_second, start_time, end_time, lock_duration)
    }

    pub fn init_stake_controller(ctx: Context<InitStakeController>) -> Result<()> {
        instructions::init_stake_controller::init_stake_contrller(ctx)
    }

    pub fn update_controller(
        ctx: Context<UpdateController>,
        collection: Option<Pubkey>,
        reward_per_token_per_second: Option<u64>,
        start_time: Option<i64>,
        end_time: Option<i64>,
        lock_duration: Option<i64>
    ) -> Result<()> {
        instructions::update_controller::update_controller(ctx, collection, reward_per_token_per_second, start_time, end_time, lock_duration)
    }

    pub fn withdraw_reward(ctx: Context<WithdrawReward>) -> Result<()> {
        instructions::withdraw_reward::withdraw_reward(ctx)
    }

    pub fn stake(ctx: Context<Stake>) -> Result<()> {
        instructions::stake::stake(ctx)
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        instructions::unstake::unstake(ctx)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        instructions::claim::claim(ctx)
    }
}

