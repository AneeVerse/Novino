-- Fix carts table foreign key constraint
-- Drop the incorrect foreign key constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'carts_user_id_fkey' 
        AND table_name = 'carts'
    ) THEN
        ALTER TABLE public.carts DROP CONSTRAINT carts_user_id_fkey;
    END IF;
END $$;

-- Add the correct foreign key constraint pointing to auth.users
ALTER TABLE public.carts 
ADD CONSTRAINT carts_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Verify the constraint
DO $$ 
BEGIN
    RAISE NOTICE 'Foreign key constraint fixed: carts.user_id now references auth.users(id)';
END $$;
