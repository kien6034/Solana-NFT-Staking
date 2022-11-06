use anchor_lang::prelude::*;

#[account]
pub struct Controller {
    pub internal_id: String,
    pub collection: Option<Pubkey>,
    pub reward_per_token_per_second: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub lock_duration: i64,
    pub authorizer: Pubkey,
    pub admins: Vec<Pubkey>,
    pub max_stake_amount: u64,
    pub accumulated_debt: u64,
    pub last_update_time: i64,
    pub total_amount_staked: u64,
    pub total_reward_claimed: u64,
    pub total_user_staked: u64,
    pub bump: u8,
    pub vault_bump: u8
}


impl Controller {
    //todo: implement LEN for the struct data 
    pub const LEN: usize = 400;

    pub fn check_stake_time(&self) -> bool {
        let now_ts = Clock::get().unwrap().unix_timestamp;

        if now_ts < self.start_time {
            return false;
        }

        if self.end_time == 0 || now_ts <= self.end_time{
            return true;
        }
        return false;
    }

    pub fn get_applicable_time(&self)-> i64 {
        let now_ts = Clock::get().unwrap().unix_timestamp;

        if now_ts <= self.end_time || self.end_time == 0 {
            return now_ts;
        }
        return self.end_time;
    }

    pub fn get_time_diff(&self) -> i64 {
        let now_ts = Clock::get().unwrap().unix_timestamp;
        let applicable_time = self.get_applicable_time();
        
        if self.start_time > now_ts {
            return 0
        }
        applicable_time - self.last_update_time
    }

    pub fn get_full_stake_reward(&self) -> u64 {
        self.accumulated_debt + self.reward_per_token_per_second * self.get_time_diff() as u64
    }
}

