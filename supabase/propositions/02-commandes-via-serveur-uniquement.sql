-- PROPOSITION — NE PAS EXÉCUTER SANS VALIDATION.
--
-- Problème : la règle "Anyone can insert orders" permet à n'importe qui d'insérer une
-- commande directement dans la base avec la clé publique, en contournant le site et
-- donc la vérification des prix et des frais de livraison (fausses commandes).
--
-- Effet de cette migration : seules les commandes passées par le site (fonction
-- serveur createOrder, qui utilise la clé de service sur Lovable Cloud) sont acceptées.
--
-- Conséquence à connaître : en local (sans SUPABASE_SERVICE_ROLE_KEY dans .env), le
-- site ne pourra plus enregistrer de commande et affichera un message d'erreur. C'est
-- voulu : le site local est branché sur la base de production.
--
-- Prérequis : le nouveau code du site doit être publié AVANT d'appliquer ceci.

DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

-- Retour arrière (recrée la règle précédente à l'identique) :
-- CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT TO anon, authenticated
--   WITH CHECK (
--     char_length(customer_name) BETWEEN 1 AND 200
--     AND char_length(customer_phone) BETWEEN 3 AND 50
--     AND char_length(customer_address) BETWEEN 1 AND 1000
--     AND total >= 0
--     AND jsonb_typeof(items) = 'array'
--   );
