// src/components/winners-card.tsx
import React from 'react';
import { PublicKey } from '@solana/web3.js';
import { useLotteryProgram, useLotteryProgramAccount } from '../lottery/lottery-data-access';
import { useWallet } from '@solana/wallet-adapter-react';

interface WinnersCardProps {
  keys: Tickets[] | undefined;
}

interface Tickets {
  number: number;
  user: PublicKey | null;
}

const truncatePublicKey = (key: string | null) => (key ? `${key.slice(0, 4)}...${key.slice(-4)}` : 'N/A');

const WinnersCard: React.FC<WinnersCardProps> = ({ keys }) => {
  const { publicKey } = useWallet();

  if (!keys || keys.length === 0) {
    return <p>No winners yet.</p>;
  }

  return (
    <div className="winners-card text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Winners</h2>
      <div className="max-h-64 overflow-y-auto">
        <ul className="space-y-4">
          {keys.map((winner, index) => (
            <li
              key={index}
              className="border-white border text-gray-500 p-2 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <p className="font-bold">Winner #{index + 1}</p>
                <p className="text-sm">Public Key: {truncatePublicKey(winner.user && winner.user.toString())}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">Ticket Number</p>
                <p className="text-2xl">{winner.number}</p>
                {winner.user && publicKey && winner.user.equals(publicKey) && (
                  <ClaimPrizeButton winner={winner} />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ClaimPrizeButton: React.FC<{ winner: Tickets }> = ({ winner }) => {
  // @ts-ignore
  const { claimPrize, accountQuery } = useLotteryProgramAccount({ account: winner.user });
  const { winners } = useLotteryProgram();

  const handleClaim = async () => {
    try {
      // @ts-ignore
      await claimPrize.mutateAsync({ user: winner.user, ticket_number: winner.number });
      accountQuery.refetch();
      winners.refetch();
    } catch (error) {
      console.error('Failed to claim prize:', error);
    }
  };

  return (
    <button onClick={handleClaim} className="btn btn-primary mt-2">
      Claim Prize
    </button>
  );
};

export default WinnersCard;
