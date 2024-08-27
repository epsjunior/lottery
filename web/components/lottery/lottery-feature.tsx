'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useLotteryProgram } from './lottery-data-access';
import { LotteryCreate } from './lottery-ui';

export default function LotteryFeature() {
  const { publicKey } = useWallet();
  const { programId } = useLotteryProgram();

  return publicKey ? (
    <div>
      <AppHero
        title=""
        subtitle={
          'Welcome to our Solana-powered Lottery Game! Purchase a ticket and be part of the thrilling draw. Once the last ticket is sold, a winner is instantly chosen, and the game resets for a new round. If you\'re the lucky winner, claim your reward right away. Join now and see if fortune favors you in the next round!'
        }
      >
        <LotteryCreate />
      </AppHero>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
