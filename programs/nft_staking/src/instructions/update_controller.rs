
use anchor_lang::prelude::*;
use crate::state::Controller;
use crate::errors::{UpdateControllerError};

pub fn update_controller(
    ctx: Context<UpdateController>,
    collection: Option<Pubkey>,
    reward_per_token_per_second: Option<u64>,
    start_time: Option<i64>,
    end_time: Option<i64>,
    lock_duration: Option<i64>
) -> Result<()> {
    let now_ts = Clock::get().unwrap().unix_timestamp;

    //********** CONSTRAIN  ********* */
    let controller = &mut ctx.accounts.controller;

    match reward_per_token_per_second {
        Some(rptps) => controller.reward_per_token_per_second = rptps,
        None => {}
    };

    match lock_duration {
        Some(ld) => controller.lock_duration = ld,
        None => {}
    };

    if now_ts >= controller.start_time {
        // These two fields, start time and collection, can only be updated when the pool has not yet started 
        match end_time {
            Some(et) => {
                // End time should not be smaller than the current time 
                require!(et == 0 || et > now_ts, UpdateControllerError::EndTimeNotValid);   
                controller.end_time = et;
            },
            None => {}
        }

        match collection {
            Some(addr) => controller.collection = Some(addr),
            None => {}
        };
    }
    else {
        // If not to start time yet, we can change the pool at our will
        match start_time {
            Some(st) => {
                controller.start_time = st;
            },
            None => {}
        }

        match end_time {
            Some(et)=>{
                require!(et == 0 || et > controller.start_time, UpdateControllerError::EndTimeNotValid);
            },
            None => {}
        }
    }

    // logging 
    msg!("action: update_staking_pool");
    msg!("start_time: {}", controller.start_time);
    msg!("end_time: {}", controller.end_time);
    msg!("reward_per_token_per_second: {}", controller.reward_per_token_per_second);
    msg!("lock_duration: {}", controller.lock_duration);
    msg!("collection: {}", controller.collection.unwrap_or_default());

    Ok(())
}

#[derive(Accounts)]

pub struct UpdateController<'info> {
    #[account(mut)]
    pub authorizer: Signer<'info>,

    #[account(
        mut,
        has_one = authorizer
    )]
    pub controller: Account<'info, Controller>,
}