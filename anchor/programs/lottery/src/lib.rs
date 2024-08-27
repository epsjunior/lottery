use anchor_lang::prelude::*;

declare_id!("3cKHyMrL3iDK6AuncuewRZT3KYdqJhn5PDAdhPsLR52w");

#[program]
pub mod lottery {
  use super::*;

  pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let bingo_account = &mut ctx.accounts.bingo_account;

    if bingo_account.initialized {
      return Err(ErrorCode::AlreadyInitialized.into());
    }

    reset_tickets(ctx.accounts.user.key(), bingo_account)?;

    bingo_account.initialized = true;
    bingo_account.counter = 0;

    Ok(())
  }

  pub fn buy_ticket(ctx: Context<BuyTicket>, chosen_number: u8) -> Result<()> {
    let bingo_account = &mut ctx.accounts.bingo_account;
    let user = &ctx.accounts.user;

    if !bingo_account.initialized {
      return Err(ErrorCode::Uninitialized.into());
    }

    if let Some(ticket) = bingo_account.tickets.iter_mut().find(|t| t.number == chosen_number) {
      if ticket.user.is_none() {
        ticket.user = Some(user.key().clone());

        transfer_sol(&ctx.accounts.system_program, &user.to_account_info(), &bingo_account.to_account_info(), 1_000_000_000, "system_program")?;

        bingo_account.counter += 1;
        if bingo_account.counter == 25 {
          select_winner(ctx)?;
        }
        Ok(())
      } else {
        Err(ErrorCode::NumberAlreadyTaken.into())
      }
    } else {
      Err(ErrorCode::NumberNotAvailable.into())
    }
  }

  pub fn claim_reward(ctx: Context<ClaimReward>, ticket_number:u8) -> Result<()> {
    let winners = &mut ctx.accounts.winners;
    let user = &ctx.accounts.user;

    if let Some(ticket) = winners.keys.iter().find(|&t| t.user == Some(user.key().clone())) {
      transfer_sol(&ctx.accounts.system_program, &ctx.accounts.bingo_account.to_account_info(), &user.to_account_info(), 25_000_000_000, "borrow_lamports")?;

      winners.keys.retain(|t| !(t.user == Some(user.key().clone()) && t.number == ticket_number));

      Ok(())
    } else {
      Err(ErrorCode::NotAWinner.into())
    }
  }
}

fn reset_tickets(user_key: Pubkey, bingo_account: &mut Account<BingoAccount>) -> Result<()> {
  let numbers = generate_shuffled_numbers(user_key)?;
  bingo_account.tickets = numbers
    .into_iter()
    .take(25)
    .map(|num| Ticket { number: num, user: None })
    .collect();
  Ok(())
}

fn generate_shuffled_numbers(user_key: Pubkey) -> Result<Vec<u8>> {
  let mut numbers: Vec<u8> = (1..=75).collect();

  let clock = Clock::get()?;

  let mut seed = (clock.unix_timestamp as u64)
    .wrapping_mul(user_key.to_bytes()[0] as u64)
    .wrapping_add(user_key.to_bytes()[1] as u64);

  for i in (1..numbers.len()).rev() {
    seed = (seed ^ (seed << 13)).wrapping_add(i as u64); // A simple PRNG step
    let j = (seed as usize) % (i + 1);
    numbers.swap(i, j);
  }

  Ok(numbers)
}

fn transfer_sol<'info>(
  system_program: &Program<'info, System>,
  from: &AccountInfo<'info>,
  to: &AccountInfo<'info>,
  amount: u64,
  transfer_type: &str
) -> Result<()> {
  if **from.try_borrow_lamports()? < amount {
    return Err(ErrorCode::InsufficientLamports.into());
  }
  if transfer_type == "system_program" {
    let cpi_accounts = anchor_lang::system_program::Transfer { from: from.clone(), to: to.clone() };
    let cpi_context = CpiContext::new(system_program.to_account_info(), cpi_accounts);
    anchor_lang::system_program::transfer(cpi_context, amount)?;
  }else {
    **from.to_account_info().try_borrow_mut_lamports()? -= amount;
    **to.to_account_info().try_borrow_mut_lamports()? += amount;
  }
  
  Ok(())
}

fn select_winner(ctx: Context<BuyTicket>) -> Result<()> {
  let bingo_account = &mut ctx.accounts.bingo_account;
  let winners = &mut ctx.accounts.winners;
  let user = &ctx.accounts.user;

  let clock = Clock::get()?;
  let user_key = user.key();

  // Generate a seed based on the timestamp and user's public key
  let seed = (clock.unix_timestamp as u64)
    .wrapping_mul(user_key.to_bytes()[0] as u64)
    .wrapping_add(user_key.to_bytes()[1] as u64);

  // Generate a random index to select a winner
  let random_index = (seed ^ (seed << 13)).wrapping_add(bingo_account.tickets.len() as u64) as usize % bingo_account.tickets.len();
  let winner_ticket = bingo_account.tickets[random_index].clone();

  // Add the winner to the list
  winners.keys.push( winner_ticket);
  
  bingo_account.counter = 0;
  // Reset tickets for the next round
  reset_tickets(user_key, bingo_account)?;

  Ok(())
}

#[account]
#[derive(InitSpace)]
pub struct Winners {
  #[max_len(25)]
  pub keys: Vec<Ticket>,
}

#[account]
#[derive(InitSpace)]
pub struct BingoAccount {
  #[max_len(25)]
  pub tickets: Vec<Ticket>,
  pub initialized: bool,
  pub counter: i8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Ticket {
  pub number: u8,
  pub user: Option<Pubkey>,
}

impl Space for Ticket {
  const INIT_SPACE: usize = 1 + 32;
}

#[derive(Accounts)]
pub struct Initialize<'info> {
  #[account(
        init_if_needed,
        seeds = [b"bingo_account"],
        bump,
        payer = user,
        space = 8 + BingoAccount::INIT_SPACE
  )]
  pub bingo_account: Account<'info, BingoAccount>,
  #[account(
        init_if_needed,
        seeds = [b"winners_account"],
        bump,
        payer = user,
        space = 8 + Winners::INIT_SPACE
  )]
  pub winners: Account<'info, Winners>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
  #[account(mut)]
  pub bingo_account: Account<'info, BingoAccount>,
  #[account(mut)]
  pub winners: Account<'info, Winners>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
  #[account(mut)]
  pub bingo_account: Account<'info, BingoAccount>,
  #[account(mut)]
  pub winners: Account<'info, Winners>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
  #[msg("The game has already been initialized.")]
  AlreadyInitialized,
  #[msg("The game is not initialized.")]
  Uninitialized,
  #[msg("The chosen number is not available.")]
  NumberNotAvailable,
  #[msg("The number is already taken.")]
  NumberAlreadyTaken,
  #[msg("Randomness generation failed.")]
  RandomnessFailed,
  #[msg("You are not a winner.")]
  NotAWinner,
  #[msg("Insufficient lamports for the transaction.")]
  InsufficientLamports,
}
