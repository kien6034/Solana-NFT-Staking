import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import * as spl from '@solana/spl-token';


export const createMintToken = async (provider: anchor.AnchorProvider): Promise<anchor.web3.PublicKey> => {
    const tokenMint = new anchor.web3.Keypair();
    const lamportsForMint = await provider.connection.getMinimumBalanceForRentExemption(spl.MintLayout.span);
    let tx = new anchor.web3.Transaction();

    // Allocate mint
    tx.add(
        anchor.web3.SystemProgram.createAccount({
            programId: spl.TOKEN_PROGRAM_ID,
            space: spl.MintLayout.span,
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey: tokenMint.publicKey,
            lamports: lamportsForMint,
        })
    )
    // Allocate wallet account
    tx.add(
      spl.createInitializeMintInstruction(
        tokenMint.publicKey,
        6,
        provider.wallet.publicKey,
        provider.wallet.publicKey
      )
    );
      

    const signature = await provider.sendAndConfirm(tx, [tokenMint]);

    return tokenMint.publicKey;
  }

export const createMintNft  = async(provider: anchor.AnchorProvider, recepient: anchor.web3.PublicKey): Promise<[anchor.web3.PublicKey,  anchor.web3.PublicKey]> => {
    let nftMint = new anchor.web3.Keypair();
    const lamportsForMint = await provider.connection.getMinimumBalanceForRentExemption(spl.MintLayout.span);
    let tx = new anchor.web3.Transaction();

    // Allocate mint
    tx.add(
        anchor.web3.SystemProgram.createAccount({
            programId: spl.TOKEN_PROGRAM_ID,
            space: spl.MintLayout.span,
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey: nftMint.publicKey,
            lamports: lamportsForMint,
        })
    )
    // Allocate wallet account
    tx.add(
      spl.createInitializeMintInstruction(
        nftMint.publicKey,
        0,
        provider.wallet.publicKey,
        provider.wallet.publicKey
      )
    );

    const associatedTokenAccount = await spl.getAssociatedTokenAddress(
      nftMint.publicKey,
      recepient
    );

    tx.add(
      spl.createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        associatedTokenAccount,
        recepient,
        nftMint.publicKey
      )
    )

    tx.add(spl.createMintToInstruction(
      nftMint.publicKey,
      associatedTokenAccount,
      provider.wallet.publicKey,
      1
    ))

    tx.add(spl.createSetAuthorityInstruction(
      nftMint.publicKey,
      provider.wallet.publicKey,
      spl.AuthorityType.MintTokens,
      null
    ))

    const signature = await provider.sendAndConfirm(tx, [nftMint]);

    return [nftMint.publicKey, associatedTokenAccount];
  }


export const getAtaAccount = async(mint: anchor.web3.PublicKey, wallet: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> =>{
    let userAssociatedTokenAccount = await spl.getAssociatedTokenAddress(
        mint,
        wallet
    )
    return userAssociatedTokenAccount
}

export const createUserAndAssociatedWallet = async (provider: anchor.AnchorProvider, mint: anchor.web3.PublicKey, createAta: boolean, amount?: bigint ): Promise<[anchor.web3.Keypair, anchor.web3.PublicKey | undefined]> => {
    const user = new anchor.web3.Keypair();
    let userAssociatedTokenAccount: anchor.web3.PublicKey | undefined = undefined;

    // Fund user with some SOL
    let txFund = new anchor.web3.Transaction();
    txFund.add(anchor.web3.SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: user.publicKey,
        lamports: 5 * anchor.web3.LAMPORTS_PER_SOL,
    }));
    const sigTxFund = await provider.sendAndConfirm(txFund);

    if (mint) {
        // Create a token account for the user and mint some tokens
        userAssociatedTokenAccount = await spl.getAssociatedTokenAddress(
            mint,
            user.publicKey
        )
          
        if (!amount && createAta == false){
          //pass 
        }  
        else{
          const txFundTokenAccount = new anchor.web3.Transaction();
        if (createAta){
          txFundTokenAccount.add(spl.createAssociatedTokenAccountInstruction(
            user.publicKey,
            userAssociatedTokenAccount,
            user.publicKey,
            mint
            // spl.ASSOCIATED_TOKEN_PROGRAM_ID,
            // spl.TOKEN_PROGRAM_ID,
            // mint,
            // userAssociatedTokenAccount,
            // user.publicKey,
            // user.publicKey,
        ))
        }
        

        if (amount){
          txFundTokenAccount.add(spl.createMintToInstruction(
            mint,
            userAssociatedTokenAccount,
            provider.wallet.publicKey,
            amount
        ));
        }

        
        const payer = anchor.web3.Keypair.generate();

            // Airdropping tokens to a payer.
        await provider.connection.confirmTransaction(
          await provider.connection.requestAirdrop(payer.publicKey, 1000000000),
          "processed"
        );
        
        
        const txFundTokenSig = await provider.sendAndConfirm(txFundTokenAccount, [user]);

        let data = await spl.getAccount(provider.connection, userAssociatedTokenAccount);
        }

        
    }
    return [user, userAssociatedTokenAccount];
}  


export const transferToken = async(provider: anchor.AnchorProvider, source: anchor.web3.PublicKey, destination: anchor.web3.PublicKey, owner: anchor.web3.Keypair, amount: number)=>{
  const txTransfer = new anchor.web3.Transaction;

  txTransfer.add(spl.createTransferInstruction(
    source,
    destination,
    owner.publicKey,
    amount
  ));
  await provider.sendAndConfirm(txTransfer, [owner]);
}


export const getAccountInfo = async(provider: anchor.AnchorProvider, tokenAccount: anchor.web3.PublicKey) =>{
  return await spl.getAccount(provider.connection, tokenAccount)
}

export const getSplBalance = async(provider: anchor.AnchorProvider, tokenAccount: anchor.web3.PublicKey) =>{
  const accountInfo = await spl.getAccount(provider.connection, tokenAccount);
  return accountInfo.amount;
}