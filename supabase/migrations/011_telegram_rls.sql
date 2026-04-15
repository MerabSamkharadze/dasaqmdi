-- Security hardening: enable RLS on telegram_subscriptions.
-- No policies are defined on purpose — bot handlers use the service_role client,
-- which bypasses RLS. Authenticated/anon users get zero access.

ALTER TABLE public.telegram_subscriptions ENABLE ROW LEVEL SECURITY;
