export type NftStaking = {
  "version": "0.1.0",
  "name": "nft_staking",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintOfRewardToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "internalId",
          "type": "string"
        },
        {
          "name": "collection",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "rewardPerTokenPerSecond",
          "type": "u64"
        },
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "lockDuration",
          "type": "i64"
        },
        {
          "name": "maxStakeAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initStakeController",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeController",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateController",
      "accounts": [
        {
          "name": "authorizer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "collection",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "rewardPerTokenPerSecond",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "startTime",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "endTime",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "lockDuration",
          "type": {
            "option": "i64"
          }
        }
      ]
    },
    {
      "name": "updateAdmin",
      "accounts": [
        {
          "name": "authorizer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "idx",
          "type": "u8"
        },
        {
          "name": "admin",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "withdrawReward",
      "accounts": [
        {
          "name": "authorizer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintOfRewardToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "controller",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authorizerRewardTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintOfNft",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeController",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerNftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "internalId",
          "type": "string"
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeController",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerNftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "internalId",
          "type": "string"
        }
      ]
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeController",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintOfRewardToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerRewardTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "internalId",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "controller",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "internalId",
            "type": "string"
          },
          {
            "name": "collection",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "rewardPerTokenPerSecond",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "lockDuration",
            "type": "i64"
          },
          {
            "name": "authorizer",
            "type": "publicKey"
          },
          {
            "name": "admins",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "maxStakeAmount",
            "type": "u64"
          },
          {
            "name": "accumulatedDebt",
            "type": "u64"
          },
          {
            "name": "lastUpdateTime",
            "type": "i64"
          },
          {
            "name": "totalAmountStaked",
            "type": "u64"
          },
          {
            "name": "totalRewardClaimed",
            "type": "u64"
          },
          {
            "name": "totalUserStaked",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "stakeController",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalNftStaked",
            "type": "u64"
          },
          {
            "name": "totalRewardClaimed",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "stakeInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stakeTime",
            "type": "i64"
          },
          {
            "name": "mintOfNft",
            "type": "publicKey"
          },
          {
            "name": "rewardDebt",
            "type": "u64"
          },
          {
            "name": "claimedReward",
            "type": "u64"
          },
          {
            "name": "pendingReward",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitializeError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "StartTimeNotValid"
          },
          {
            "name": "EndTimeGreaterThanStartTime"
          }
        ]
      }
    },
    {
      "name": "UpdateControllerError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "EndTimeNotValid"
          }
        ]
      }
    },
    {
      "name": "StakeError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidCollection"
          },
          {
            "name": "Unverified"
          },
          {
            "name": "NotACollectible"
          },
          {
            "name": "InvalidMetadataAccount"
          },
          {
            "name": "StakeAmountExceeded"
          }
        ]
      }
    },
    {
      "name": "ClaimError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InsufficentRewardFund"
          }
        ]
      }
    },
    {
      "name": "UnstakeError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "ReturnLamportError"
          }
        ]
      }
    },
    {
      "name": "WithdrawError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WithdrawError"
          }
        ]
      }
    },
    {
      "name": "UpdateAdminErrors",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidUpdateIndex"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotInStakeTime"
    }
  ]
};

export const IDL: NftStaking = {
  "version": "0.1.0",
  "name": "nft_staking",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintOfRewardToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "internalId",
          "type": "string"
        },
        {
          "name": "collection",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "rewardPerTokenPerSecond",
          "type": "u64"
        },
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "lockDuration",
          "type": "i64"
        },
        {
          "name": "maxStakeAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initStakeController",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeController",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateController",
      "accounts": [
        {
          "name": "authorizer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "collection",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "rewardPerTokenPerSecond",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "startTime",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "endTime",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "lockDuration",
          "type": {
            "option": "i64"
          }
        }
      ]
    },
    {
      "name": "updateAdmin",
      "accounts": [
        {
          "name": "authorizer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "idx",
          "type": "u8"
        },
        {
          "name": "admin",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "withdrawReward",
      "accounts": [
        {
          "name": "authorizer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintOfRewardToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "controller",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authorizerRewardTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintOfNft",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeController",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerNftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "internalId",
          "type": "string"
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeController",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerNftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "internalId",
          "type": "string"
        }
      ]
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeController",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintOfRewardToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerRewardTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "internalId",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "controller",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "internalId",
            "type": "string"
          },
          {
            "name": "collection",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "rewardPerTokenPerSecond",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "lockDuration",
            "type": "i64"
          },
          {
            "name": "authorizer",
            "type": "publicKey"
          },
          {
            "name": "admins",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "maxStakeAmount",
            "type": "u64"
          },
          {
            "name": "accumulatedDebt",
            "type": "u64"
          },
          {
            "name": "lastUpdateTime",
            "type": "i64"
          },
          {
            "name": "totalAmountStaked",
            "type": "u64"
          },
          {
            "name": "totalRewardClaimed",
            "type": "u64"
          },
          {
            "name": "totalUserStaked",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "stakeController",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalNftStaked",
            "type": "u64"
          },
          {
            "name": "totalRewardClaimed",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "stakeInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stakeTime",
            "type": "i64"
          },
          {
            "name": "mintOfNft",
            "type": "publicKey"
          },
          {
            "name": "rewardDebt",
            "type": "u64"
          },
          {
            "name": "claimedReward",
            "type": "u64"
          },
          {
            "name": "pendingReward",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitializeError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "StartTimeNotValid"
          },
          {
            "name": "EndTimeGreaterThanStartTime"
          }
        ]
      }
    },
    {
      "name": "UpdateControllerError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "EndTimeNotValid"
          }
        ]
      }
    },
    {
      "name": "StakeError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidCollection"
          },
          {
            "name": "Unverified"
          },
          {
            "name": "NotACollectible"
          },
          {
            "name": "InvalidMetadataAccount"
          },
          {
            "name": "StakeAmountExceeded"
          }
        ]
      }
    },
    {
      "name": "ClaimError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InsufficentRewardFund"
          }
        ]
      }
    },
    {
      "name": "UnstakeError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "ReturnLamportError"
          }
        ]
      }
    },
    {
      "name": "WithdrawError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WithdrawError"
          }
        ]
      }
    },
    {
      "name": "UpdateAdminErrors",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidUpdateIndex"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotInStakeTime"
    }
  ]
};
