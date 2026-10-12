-- This migration (already applied on 2026-05-20) used to reset an administrator's
-- password with the password written in clear text in this file. The content was
-- removed on 2026-10-12: secrets must never be stored in the repository.
-- The old password is still visible in the git history, so it must be considered
-- compromised and changed from the site ("Mot de passe oublié ?").
-- Supabase Auth itself stores passwords hashed (bcrypt).
SELECT 1;
