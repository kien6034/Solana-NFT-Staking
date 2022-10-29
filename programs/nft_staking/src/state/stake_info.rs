use anchor_lang::prelude::*;
use crate::state::Controller;

#[account]
pub struct StakeInfo {
    pub stake_time: i64,
    pub mint_of_nft: Pubkey,
    pub reward_debt: u64,
    pub claimed_reward: u64,
    pub pending_reward: u64,
    pub bump: u8
}


impl StakeInfo {
    //todo: implement LEN for the struct data 
    pub const LEN: usize = 200;

    pub fn get_pending_reward(&self, controller: &Controller) -> u64{
        let now_ts = Clock::get().unwrap().unix_timestamp;

        if self.stake_time + controller.lock_duration > now_ts {
            return 0;
        } 
        
        let full_stake_reward = controller.get_full_stake_reward();
        full_stake_reward - (self.reward_debt + self.claimed_reward)
    }
}