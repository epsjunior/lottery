/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/lottery.json`.
 */
export type Lottery = {
  "address": "3cKHyMrL3iDK6AuncuewRZT3KYdqJhn5PDAdhPsLR52w",
  "metadata": {
    "name": "lottery",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyTicket",
      "discriminator": [
        11,
        24,
        17,
        193,
        168,
        116,
        164,
        169
      ],
      "accounts": [
        {
          "name": "bingoAccount",
          "writable": true
        },
        {
          "name": "winners",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "chosenNumber",
          "type": "u8"
        }
      ]
    },
    {
      "name": "claimReward",
      "discriminator": [
        149,
        95,
        181,
        242,
        94,
        90,
        158,
        162
      ],
      "accounts": [
        {
          "name": "bingoAccount",
          "writable": true
        },
        {
          "name": "winners",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "ticketNumber",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "bingoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  110,
                  103,
                  111,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "winners",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  110,
                  110,
                  101,
                  114,
                  115,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "bingoAccount",
      "discriminator": [
        32,
        246,
        219,
        220,
        244,
        135,
        218,
        11
      ]
    },
    {
      "name": "winners",
      "discriminator": [
        124,
        173,
        245,
        175,
        40,
        115,
        199,
        91
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyInitialized",
      "msg": "The game has already been initialized."
    },
    {
      "code": 6001,
      "name": "uninitialized",
      "msg": "The game is not initialized."
    },
    {
      "code": 6002,
      "name": "numberNotAvailable",
      "msg": "The chosen number is not available."
    },
    {
      "code": 6003,
      "name": "numberAlreadyTaken",
      "msg": "The number is already taken."
    },
    {
      "code": 6004,
      "name": "randomnessFailed",
      "msg": "Randomness generation failed."
    },
    {
      "code": 6005,
      "name": "notAWinner",
      "msg": "You are not a winner."
    },
    {
      "code": 6006,
      "name": "insufficientLamports",
      "msg": "Insufficient lamports for the transaction."
    }
  ],
  "types": [
    {
      "name": "bingoAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tickets",
            "type": {
              "vec": {
                "defined": {
                  "name": "ticket"
                }
              }
            }
          },
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "counter",
            "type": "i8"
          }
        ]
      }
    },
    {
      "name": "ticket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "number",
            "type": "u8"
          },
          {
            "name": "user",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "winners",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "keys",
            "type": {
              "vec": {
                "defined": {
                  "name": "ticket"
                }
              }
            }
          }
        ]
      }
    }
  ]
};
