DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MemberCategory') THEN
    IF EXISTS (
      SELECT 1
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'MemberCategory' AND e.enumlabel = 'Visitante'
    ) THEN
      ALTER TYPE "MemberCategory" RENAME VALUE 'Visitante' TO 'VISITANTE';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'MemberCategory' AND e.enumlabel = 'Membro Novo'
    ) THEN
      ALTER TYPE "MemberCategory" RENAME VALUE 'Membro Novo' TO 'MEMBRO_NOVO';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'MemberCategory' AND e.enumlabel = 'Adulto'
    ) THEN
      ALTER TYPE "MemberCategory" RENAME VALUE 'Adulto' TO 'ADULTO';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'MemberCategory' AND e.enumlabel = 'Membro Regular'
    ) THEN
      ALTER TYPE "MemberCategory" RENAME VALUE 'Membro Regular' TO 'MEMBRO_REGULAR';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'MemberCategory' AND e.enumlabel = 'Membro Ativo'
    ) THEN
      ALTER TYPE "MemberCategory" RENAME VALUE 'Membro Ativo' TO 'MEMBRO_ATIVO';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'MemberCategory' AND e.enumlabel = 'Membro Visitante'
    ) THEN
      ALTER TYPE "MemberCategory" RENAME VALUE 'Membro Visitante' TO 'MEMBRO_VISITANTE';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'MemberCategory' AND e.enumlabel = 'Jovem'
    ) THEN
      ALTER TYPE "MemberCategory" RENAME VALUE 'Jovem' TO 'JOVEM';
    END IF;
  END IF;
END $$;
