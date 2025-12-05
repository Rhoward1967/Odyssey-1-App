-- Safe RPC for paystubs updates
CREATE OR REPLACE FUNCTION public.safe_update_paystubs(
  payperiodstart date DEFAULT NULL,
  payperiodend date DEFAULT NULL,
  status text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  IF payperiodstart IS NULL OR payperiodend IS NULL OR status IS NULL THEN
    RAISE EXCEPTION 'Missing required fields';
  END IF;
  UPDATE public.paystubs
  SET status = status
  WHERE (payperiodstart IS NULL OR paystubs.payperiodstart = payperiodstart)
    AND (payperiodend IS NULL OR paystubs.payperiodend = payperiodend)
    AND (status IS NULL OR paystubs.status = status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
