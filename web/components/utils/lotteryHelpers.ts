import { PublicKey } from '@solana/web3.js';

export const findProgramAddresses = async (programId: PublicKey) => {
  const bingo = await PublicKey.findProgramAddress([Buffer.from("bingo_account")], programId);
  const winners = await PublicKey.findProgramAddress([Buffer.from("winners_account")], programId);
  return { bingo, winners };
};
