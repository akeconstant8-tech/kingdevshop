UPDATE auth.users 
SET encrypted_password = crypt('05947273', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'komlandavid98@gmail.com';