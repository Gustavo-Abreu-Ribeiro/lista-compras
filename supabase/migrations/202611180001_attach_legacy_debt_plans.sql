-- Convert a debt from the previous open-ended recurrence model into a finite plan.
create or replace function public.app_set_financial_debt_plan(
  p_debt_id bigint,
  p_installment_count integer,
  p_installment_cents bigint,
  p_first_due_on date
) returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  owner uuid := auth.uid();
  debt_row public.app_financial_debts%rowtype;
  due_month date;
  day_of_month integer;
  installment_index integer;
  legacy_recurrence_ids bigint[];
begin
  if owner is null then raise exception 'Authentication required'; end if;
  if p_installment_cents <= 0 then raise exception 'Installment amount must be positive'; end if;
  if p_installment_count < 1 or p_installment_count > 120 then
    raise exception 'Installment count must be between 1 and 120';
  end if;
  if p_first_due_on is null then raise exception 'First due date is required'; end if;

  select * into debt_row
  from public.app_financial_debts
  where id = p_debt_id and owner_id = owner
  for update;

  if not found then raise exception 'Debt not found'; end if;
  if exists (
    select 1 from public.app_financial_installments
    where debt_id = debt_row.id and owner_id = owner
  ) then raise exception 'Debt already has an installment plan'; end if;
  if p_installment_cents::numeric * p_installment_count < debt_row.balance_cents then
    raise exception 'Planned payments cannot be less than the recorded debt total';
  end if;

  select coalesce(array_agg(id), array[]::bigint[]) into legacy_recurrence_ids
  from public.app_financial_recurrences
  where owner_id = owner
    and description = 'Pagamento da dívida: ' || debt_row.name
    and amount_cents = debt_row.monthly_payment_cents
    and day_of_month = debt_row.due_day;

  if cardinality(legacy_recurrence_ids) > 1 then
    raise exception 'More than one matching recurrence; review this debt before conversion';
  end if;

  if cardinality(legacy_recurrence_ids) > 0 then
    delete from public.app_financial_transactions
    where owner_id = owner
      and recurrence_id = any(legacy_recurrence_ids)
      and status = 'planned';

    update public.app_financial_recurrences
    set active = false
    where owner_id = owner and id = any(legacy_recurrence_ids);
  end if;

  update public.app_financial_debts
  set monthly_payment_cents = p_installment_cents,
      due_day = extract(day from p_first_due_on)::integer
  where id = debt_row.id and owner_id = owner;

  day_of_month := extract(day from p_first_due_on)::integer;
  for installment_index in 0..(p_installment_count - 1) loop
    due_month := (date_trunc('month', p_first_due_on::timestamp)
      + make_interval(months => installment_index))::date;
    insert into public.app_financial_installments
      (owner_id, description, amount_cents, due_on, debt_id, state)
    values (
      owner,
      debt_row.name || ' · parcela ' || (installment_index + 1) || '/' || p_installment_count,
      p_installment_cents,
      due_month + (least(day_of_month,
        extract(day from (due_month + interval '1 month - 1 day'))::integer) - 1),
      debt_row.id,
      'pending'
    );
  end loop;
end;
$$;

revoke all on function public.app_set_financial_debt_plan(bigint, integer, bigint, date) from public, anon;
grant execute on function public.app_set_financial_debt_plan(bigint, integer, bigint, date) to authenticated;
