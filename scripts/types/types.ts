import * as anchor from "@project-serum/anchor";

export type Controller = {
    internalId: String,
    collection: anchor.web3.PublicKey,
    rewardPerTokenPerSecond: anchor.BN,
    startTime: anchor.BN,
    endTime: anchor.BN,
    authorizer: anchor.web3.PublicKey,
    accumulatedDebt: anchor.BN,
    lastUpdateTime: anchor.BN,
    totalAmountStaked: anchor.BN,
    totalRewardClaimed: anchor.BN,
    totalUserStaked: anchor.BN,
}