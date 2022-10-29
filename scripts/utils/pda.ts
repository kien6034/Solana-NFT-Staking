import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Connection, PublicKey } from '@solana/web3.js';
import { NftStaking } from "../../target/types/nft_staking";
import { PROGRAM_ADDRESS } from "@metaplex-foundation/mpl-token-metadata";
import * as spl from '@solana/spl-token';

let METAPLEX_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
interface PDAParam {
    key: anchor.web3.PublicKey,
    bump: number
}


const CONTROLLER_PDA_SEED = "controller";
const VAULT_PDA_SEED = "vault";
const STAKE_PDA_SEED = "stake_info";
const ESCROW_PDA_SEED = "escrow";
const STAKE_CONTROLLER_PDA_SEED = "stake_controller";


export const getControllerPDA = async(program:any, mint: anchor.web3.PublicKey, internalId: string): Promise<PDAParam> => {
    const [pda, bump] = await PublicKey
      .findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode(CONTROLLER_PDA_SEED),
          mint.toBuffer(),
          anchor.utils.bytes.utf8.encode(internalId)
        ],
        program.programId
      );

      return {
        key: pda,
        bump: bump
      }
  }

export const getVaultPDA = async(program: any,mint: anchor.web3.PublicKey,internalId: string): Promise<PDAParam> => {
    const [pda, bump] = await PublicKey
      .findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode(VAULT_PDA_SEED),
          mint.toBuffer(),
          anchor.utils.bytes.utf8.encode(internalId)
        ],
        program.programId
      );

      return {
        key: pda,
        bump: bump
      }
  }

export  const getStakePDA = async(program: any,controller: anchor.web3.PublicKey, staker: anchor.web3.PublicKey, nftMint: anchor.web3.PublicKey): Promise<PDAParam> => {
    const [pda, bump] = await PublicKey
      .findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode(STAKE_PDA_SEED),
          controller.toBuffer(),
          staker.toBuffer(),
          nftMint.toBuffer()
        ],
        program.programId
      );

      return {
        key: pda,
        bump: bump
      }
  }

export const getEscrowPDA = async(program:any,controller: anchor.web3.PublicKey, staker: anchor.web3.PublicKey, nftMint: anchor.web3.PublicKey): Promise<PDAParam> => {
    const [pda, bump] = await PublicKey
      .findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode(ESCROW_PDA_SEED),
          controller.toBuffer(),
          staker.toBuffer(),
          nftMint.toBuffer()
        ],
        program.programId
      );

      return {
        key: pda,
        bump: bump
      }
  }


export const getStakeControllerPDA = async(program:any, controller: anchor.web3.PublicKey, staker: anchor.web3.PublicKey): Promise<PDAParam> => {
  const [pda, bump] = await PublicKey
    .findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode(STAKE_CONTROLLER_PDA_SEED),
        controller.toBuffer(),
        staker.toBuffer(),
      ],
      program.programId
    );

    return {
      key: pda,
      bump: bump
    }
}


export const getTokenMetadata = async(mint: anchor.web3.PublicKey) => {
  let program_id = new anchor.web3.PublicKey(PROGRAM_ADDRESS)
  const [pda, bump] = await PublicKey
    .findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("metadata"),
        program_id.toBuffer(),
        mint.toBuffer(),
        
      ],
      program_id
    );

    return {
      key: pda,
      bump: bump
    }
}

export const getAtaAccount = async(mint: anchor.web3.PublicKey, owner: anchor.web3.PublicKey) => {
  let ataAccount = await spl.getAssociatedTokenAddress(mint, owner);
  return ataAccount;
}