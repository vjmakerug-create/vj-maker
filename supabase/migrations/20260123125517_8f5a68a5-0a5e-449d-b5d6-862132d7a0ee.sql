-- Add unique constraint on phone in profiles table to ensure one phone per account
ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);

-- Create index for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);