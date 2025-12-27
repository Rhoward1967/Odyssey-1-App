-- Fix roman_knowledge_base for ON CONFLICT upsert
-- Add UNIQUE constraint to file_path column

ALTER TABLE public.roman_knowledge_base 
ADD CONSTRAINT roman_knowledge_base_file_path_key UNIQUE (file_path);

-- Verify constraint exists
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'roman_knowledge_base' 
AND constraint_type = 'UNIQUE';
