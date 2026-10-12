# Propositions de modifications de la base (non appliquées)

Ces fichiers ne sont **pas** dans `supabase/migrations/` exprès : aucun outil ne les
exécutera automatiquement. Chacun modifie la base de production et doit être validé
avant d'être exécuté (chat Lovable : « Exécute cette migration SQL… »).

| Fichier | Effet | Risque |
|---|---|---|
| `01-fusion-collections.sql` | Regroupe les 6 collections en 4 (49 produits renommés de collection). Sauvegarde les anciennes valeurs dans une table et contient la requête de retour arrière. | Faible : seuls les noms de collection changent. Validez d'abord les noms proposés. |
| `02-commandes-via-serveur-uniquement.sql` | Interdit l'insertion directe de commandes avec la clé publique (fausses commandes). | Moyen : à appliquer **après** la publication du nouveau code. En local, les commandes ne s'enregistreront plus. |
