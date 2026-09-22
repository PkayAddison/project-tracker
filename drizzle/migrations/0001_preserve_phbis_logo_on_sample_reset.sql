CREATE OR REPLACE FUNCTION public.reset_sample_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only the administrator can reset sample data';
  END IF;
  PERFORM public.seed_demo_data();
  UPDATE public.org_settings
  SET logo = '/__l5e/assets-v1/b3e412db-7066-40b0-bfd9-a24563ff4045/PHBIS.png'
  WHERE id = 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_sample_data() TO authenticated;