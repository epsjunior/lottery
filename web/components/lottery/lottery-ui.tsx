import React, { useState } from 'react';
import {
  useLotteryProgram,
} from './lottery-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import BingoCard from '@/components/bingo/bingo-card';
import WinnersCard from '@/components/bingo/winners-card';

export function LotteryCreate() {
  const { createEntry } = useLotteryProgram();
  const { publicKey } = useWallet();
  const { accounts, winners } = useLotteryProgram();
  const [showBingoCard, setShowBingoCard] = useState(true);

  const handleSubmit = () => {
    if (publicKey){
      createEntry.mutateAsync({user: publicKey});
    }
  }

  const toggleView = () => {
    winners.refetch();
    setShowBingoCard(!showBingoCard);
  };

  const winners2 = winners.data?.flatMap(account => account.account.keys || []);

  return (
    <div>
      {showBingoCard ? (
        <>
          {accounts.data?.map((account, key) => {
            if (publicKey) {
              return <BingoCard key={key} publicKey={publicKey} tickets={Array.from(account.account.tickets)} />
            }
          })}
          {accounts && accounts.data && accounts.data.length === 0 && (
            <button
              className="btn btn-xs lg:btn-md btn-primary"
              disabled={createEntry.isPending}
              onClick={handleSubmit}
            >
              Initialize {createEntry.isPending && '...'}
            </button>
          )}
        </>
      ) : (
        <WinnersCard keys={winners2} />
      )}
      <button
        className="btn btn-xs lg:btn-md bg-gray-700 mt-2"
        onClick={toggleView}
      >
        {showBingoCard ? 'Show Winners' : 'Show Bingo Card'}
      </button>
    </div>
  )
}
