-- Debt installment plans are additive; existing debts and installments remain unchanged.
alter table public.app_financial_installments
  add column if not exists debt_id bigint;

alter table public.app_financial_installments
  drop constraint if exists app_financial_installments_debt_fk;
alter table public.app_financial_installments
  add constraint app_financial_installments_debt_fk
  foreign key (debt_id, owner_id)
  references public.app_financial_debts(id, owner_id) on delete cascade;

create index if not exists app_financial_installments_debt_due_idx
  on public.app_financial_installments(owner_id, debt_id, due_on);

create or replace function public.app_create_financial_debt_plan(
  p_name text,
  p_balance_cents bigint,
  p_installment_count integer,
  p_installment_cents bigint,
  p_first_due_on date
) returns bigint
language plpgsql
security invoker
set search_path = public
as $$
declare
  owner uuid := auth.uid();
  debt_id bigint;
  due_month date;
  day_of_month integer;
  installment_index integer;
begin
  if owner is null then raise exception 'Authentication required'; end if;
  if length(trim(p_name)) = 0 then raise exception 'Debt name is required'; end if;
  if p_balance_cents <= 0 or p_installment_cents <= 0 then raise exception 'Amounts must be positive'; end if;
  if p_installment_count < 1 or p_installment_count > 120 then raise exception 'Installment count must be between 1 and 120'; end if;
  if p_first_due_on is null then raise exception 'First due date is required'; end if;
  if p_installment_cents::numeric * p_installment_count < p_balance_cents then
    raise exception 'Planned payments cannot be less than the recorded debt balance';
  end if;

  insert into public.app_financial_debts
    (owner_id, name, balance_cents, monthly_payment_cents, due_day)
  values
    (owner, trim(p_name), p_balance_cents, p_installment_cents, extract(day from p_first_due_on)::integer)
  returning id into debt_id;

  day_of_month := extract(day from p_first_due_on)::integer;
  for installment_index in 0..(p_installment_count - 1) loop
    due_month := (date_trunc('month', p_first_due_on::timestamp) + make_interval(months => installment_index))::date;
    insert into public.app_financial_installments
      (owner_id, description, amount_cents, due_on, debt_id, state)
    values (
      owner,
      trim(p_name) || ' · parcela ' || (installment_index + 1) || '/' || p_installment_count,
      p_installment_cents,
      due_month + (least(day_of_month, extract(day from (due_month + interval '1 month - 1 day'))::integer) - 1),
      debt_id,
      'pending'
    );
  end loop;
  return debt_id;
end;
$$;

revoke all on function public.app_create_financial_debt_plan(text, bigint, integer, bigint, date) from public, anon;
grant execute on function public.app_create_financial_debt_plan(text, bigint, integer, bigint, date) to authenticated;
