use anchor_lang::error_code;

#[error_code]
pub enum ControllerError {
    NotInStakeTime
}

#[error_code]
pub enum InitializeError {
    StartTimeNotValid,
    EndTimeGreaterThanStartTime
}


#[error_code]
pub enum UpdateControllerError {
    EndTimeNotValid
}

#[error_code]
pub enum StakeError {
    InvalidCollection,
    Unverified,
    NotACollectible,
    InvalidMetadataAccount,
    StakeAmountExceeded
}

#[error_code]
pub enum ClaimError {
    InsufficentRewardFund
}



#[error_code]
pub enum UnstakeError {
    ReturnLamportError,
}


#[error_code]
pub enum WithdrawError {
    WithdrawError,
}


#[error_code]
pub enum UpdateAdminErrors {
    InvalidUpdateIndex
}