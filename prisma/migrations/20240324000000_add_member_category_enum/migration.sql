-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MemberCategory') THEN
    CREATE TYPE "MemberCategory" AS ENUM (
      'VISITANTE',
      'MEMBRO_NOVO',
      'ADULTO',
      'MEMBRO_REGULAR',
      'MEMBRO_ATIVO',
      'MEMBRO_VISITANTE',
      'JOVEM'
    );
  END IF;
END $$;

-- Normalize existing values before type change
UPDATE "Person"
SET "category" = CASE "category"
  WHEN 'Visitante' THEN 'VISITANTE'
  WHEN 'Membro Novo' THEN 'MEMBRO_NOVO'
  WHEN 'Adulto' THEN 'ADULTO'
  WHEN 'Membro Regular' THEN 'MEMBRO_REGULAR'
  WHEN 'Membro Ativo' THEN 'MEMBRO_ATIVO'
  WHEN 'Membro Visitante' THEN 'MEMBRO_VISITANTE'
  WHEN 'Jovem' THEN 'JOVEM'
  ELSE "category"
END
WHERE "category" IS NOT NULL;

-- AlterTable
ALTER TABLE "Person"
ALTER COLUMN "category" TYPE "MemberCategory"
USING "category"::"MemberCategory";
