
use anchor_lang::prelude::*;
use crate::state::{Controller};
use crate::errors::{UpdateAdminErrors};

const MAX_NUM_OF_ADMINS:u8 = 5;
pub fn update_admin(
    ctx: Context<UpdateAdmin>,
    idx: u8,
    admin: Pubkey
) -> Result<()> {
    //********** CONSTRAIN  ********* */
    let controller = &mut ctx.accounts.controller;

    let admin_list_length=  controller.admins.len() as u8;

    if admin_list_length >= MAX_NUM_OF_ADMINS {
        require!(idx < MAX_NUM_OF_ADMINS, UpdateAdminErrors::InvalidUpdateIndex);
        controller.admins[idx as usize] = admin;
    } 
    else {
        // now, the admins len is not up to MAX_NUM_OF_ADMINS yet 
        if idx >= admin_list_length || admin_list_length == 0{
            // insert new admin to the vec!, when the desired index is greater than the admin len, or the admin_list_length is empty 
            controller.admins.push(admin);
        }
        else {
            //update the previous admin
            controller.admins[idx as usize] = admin;
        }
    }
  
    Ok(())
}

#[derive(Accounts)]

pub struct UpdateAdmin<'info> {
    #[account(mut)]
    pub authorizer: Signer<'info>,

    #[account(
        mut,
        has_one = authorizer
    )]
    pub controller: Account<'info, Controller>,
}