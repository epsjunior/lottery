// src/components/bingo-card.tsx
import React from 'react';
import { useLotteryProgramAccount } from '@/components/lottery/lottery-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface BingoCardProps {
  tickets: Tickets[];
  publicKey: PublicKey;
}

interface Tickets {
  number: number;
  user: PublicKey | null;
}

const BingoCard: React.FC<BingoCardProps> = ({ tickets, publicKey }) => {
  const { buyTicket } = useLotteryProgramAccount({ account: publicKey });

  const handleClick = (number: number) => {
    if (publicKey) {
      buyTicket.mutateAsync({ user: publicKey, number });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="grid grid-cols-5 grid-rows-5 gap-2 border border-black p-4">
        {tickets.map((ticket) =>
          !ticket.user ? (
            <div
              key={ticket.number.toString()}
              className="h-16 w-16 flex items-center justify-center border border-gray-400 text-xl font-semibold cursor-pointer hover:bg-gray-600"
              onClick={() => handleClick(ticket.number)}
            >
              {ticket.number}
            </div>
          ) : (
            <div
              key={ticket.number.toString()}
              className="h-16 w-16 flex items-center justify-center text-xl font-semibold"
            >
              {ticket.number}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default BingoCard;
