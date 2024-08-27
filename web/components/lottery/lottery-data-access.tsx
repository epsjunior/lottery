'use client';

import { getLotteryProgram, getLotteryProgramId } from '@lottery/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import { findProgramAddresses } from '../utils/lotteryHelpers';

interface EntryArgs {
  user: PublicKey,
  number?: number
}

export function useLotteryProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(() => getLotteryProgramId(cluster.network as Cluster), [cluster.network]);
  const program = getLotteryProgram(provider);

  const accounts = useQuery({
    queryKey: ['lottery', 'all2', { cluster }],
    queryFn: () => program.account.bingoAccount.all(),
  });

  const winners = useQuery({
    queryKey: ['lottery', 'all', { cluster }],
    queryFn: () => program.account.winners.all(),
  });

  const createEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ['lottery', 'create', { cluster }],
    mutationFn: async ({ user }) => {
      const { bingo, winners } = await findProgramAddresses(programId);
      return program.methods.initialize()
        .accountsPartial({ bingoAccount: bingo[0], winners: winners[0] })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: (error) => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    accounts,
    createEntry,
    winners,
  };
}

export function useLotteryProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { programId, program, accounts } = useLotteryProgram();

  const accountQuery = useQuery({
    queryKey: ['lottery', 'fetch', { cluster, account }],
    queryFn: () => program.account.bingoAccount.fetch(account),
  });

  const buyTicket = useMutation<string, Error, EntryArgs>({
    mutationKey: ['lottery', 'update', { cluster }],
    mutationFn: async ({ user, number }) => {
      const { bingo, winners } = await findProgramAddresses(programId);
      number = number || 0;
      return program.methods.buyTicket(number)
        .accountsPartial({ bingoAccount: bingo[0], winners: winners[0] }).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: (error) => toast.error('Failed to update account'),
  });

  const claimPrize = useMutation<string, Error, { user: PublicKey, ticket_number: number }>({
    mutationKey: ['lottery', 'claim', { cluster }],
    mutationFn: async ({ user, ticket_number }) => {
      const { bingo, winners } = await findProgramAddresses(programId);
      return program.methods.claimReward(ticket_number)
        .accountsPartial({ bingoAccount: bingo[0], winners: winners[0] })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: (error) => toast.error('Failed to claim prize'),
  });

  return {
    accountQuery,
    buyTicket,
    claimPrize,
  };
}
