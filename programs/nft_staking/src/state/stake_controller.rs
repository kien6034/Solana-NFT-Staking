use anchor_lang::prelude::*;

#[account]
pub struct StakeController {
    pub total_nft_staked: u64,
    pub total_reward_claimed: u64,
    pub bump: u8
}


impl StakeController {
    //todo: implement LEN for the struct data 
    pub const LEN: usize = 200;
}