-- PROPOSITION — NE PAS EXÉCUTER SANS VALIDATION (aucune donnée n'a été modifiée).
-- Fusion des collections en double. Généré le 2026-10-12 à partir de l'état de la base
-- (57 produits). Les produits sont ciblés par identifiant : un produit ajouté depuis
-- n'est pas touché. Les noms de collections ci-dessous sont des suggestions à valider.
--
-- Avant  : Six Pièces (6), Signature (22, mélange 13 000 et 10 000), Draps 4 pièces (10),
--          Quatre Pièces (2, 10 000 et 8 500), Parure 4 pièces (9), Parure 2 places (8)
-- Après  : Parures 6 pièces (18), Parures 4 pièces — 10 000 FCFA (21), Parures 4 pièces — 8 500 FCFA (10), Parure 2 places (8, inchangée)

BEGIN;

-- 1) Sauvegarde des collections actuelles (permet le retour arrière).
CREATE TABLE IF NOT EXISTS public.products_collections_backup_20261012 AS
  SELECT id, name, collection, now() AS saved_at FROM public.products;
ALTER TABLE public.products_collections_backup_20261012 ENABLE ROW LEVEL SECURITY;

-- 2) Regroupement.
UPDATE public.products SET collection = 'Parures 6 pièces' WHERE id IN (
  'bb3c2270-eabb-4eb5-ac58-7667d666b09e',  -- Six Pièces · 13000 · Parure Chevron Bleu — 6 pièces
  '8dadd48c-b276-4902-a7ba-112d86fea6de',  -- Six Pièces · 13000 · Parure Tartan Doré — 6 pièces
  '4c75a14b-8e87-475b-9035-26ba69457bc4',  -- Six Pièces · 13000 · Parure Géométrique Vert Sauge — 6 pièces
  '9c55b769-a2cc-4698-a300-18c2541f60a2',  -- Six Pièces · 13000 · Parure Cercles Corail — 6 pièces
  'abb61354-d962-4e44-aa30-b8f1da9f4812',  -- Six Pièces · 13000 · Parure Fleurs Orange — 6 pièces
  'b010d29c-1c80-4b33-b197-b3f265a9f9fb',  -- Signature · 13000 · Parure 6 pièces — Royal Rouge
  '0c5a865f-108c-4cdd-abb2-f90445008b28',  -- Signature · 13000 · Parure 6 pièces — Plume d'Or
  '45cde887-d8a4-469a-9003-fafcd1c488fd',  -- Signature · 13000 · Parure 6 pièces — Bleu Floral
  'fdca8e0f-ff00-46c0-a65a-a61af4a14179',  -- Signature · 13000 · Parure 6 pièces — Nuit Étoilée
  '90da5f7e-84a2-4011-b6a1-c1c5d1401fd4',  -- Signature · 13000 · Parure 6 pièces — Papillons
  'a845356e-ea55-4205-940a-871afb63e921',  -- Signature · 13000 · Parure 6 pièces — Chevron Beige
  '0a8af73b-6c80-4365-a7eb-c6b9c659cfe4',  -- Signature · 13000 · Parure 6 pièces — Pois Royal Rouge
  '2763832f-44ec-4f09-9279-3c6e953c5300',  -- Signature · 13000 · Parure 6 pièces — Plume d'Or Noir
  '376262c8-dd67-4852-8f4a-d889d47095f5',  -- Signature · 13000 · Parure 6 pièces — Arbre de Vie Bleu
  '4ea2a723-f422-4edf-8c55-277427edf06e',  -- Signature · 13000 · Parure 6 pièces — Étoile Filante Jaune
  'fefbfd8c-69cc-4381-b50d-ed61824b399f',  -- Signature · 13000 · Parure 6 pièces — Papillons Turquoise
  '2ad3c184-1bab-49dd-834a-754e83abf8f6',  -- Signature · 13000 · Parure 6 pièces — Chevron Beige & Marine
  '6528199a-0d57-43f5-a0da-dd4ba362acc9'  -- Six Pièces · 13000 · Parure 6 pièces- Eclat Moderne 
);

UPDATE public.products SET collection = 'Parures 4 pièces — 10 000 FCFA' WHERE id IN (
  'dbd48e26-d850-47fd-8e2a-1e8b0f611669',  -- Draps 4 pièces · 10000 · Drap 4 pièces - Turquoise & Pinceaux
  '79fad05d-f3ce-4944-a1c0-23bea7ef9a84',  -- Draps 4 pièces · 10000 · Drap 4 pièces - Terracotta & Volutes
  'ff78dab6-17a0-4c04-99d2-469a4191e5d0',  -- Draps 4 pièces · 10000 · Drap 4 pièces - Pois Atomiques
  '9d2c5f8b-0b43-48b8-8799-d7d18aadcf92',  -- Draps 4 pièces · 10000 · Drap 4 pièces - Bleu Écossais
  'c0bdba52-02cd-4eeb-8bde-84322e34a9c1',  -- Draps 4 pièces · 10000 · Drap 4 pièces - Vagues Vertes
  '8a51116b-5234-4293-b03b-568c9ab70f57',  -- Draps 4 pièces · 10000 · Drap 4 pièces - Géométrie Cuivre
  '3e4649b7-0613-4971-928b-5c33ebd2ecb1',  -- Draps 4 pièces · 10000 · Drap 4 pièces - Orange Vagues
  '45a0065c-0712-4c76-b173-f0b2c2f70d31',  -- Draps 4 pièces · 10000 · Drap 4 pièces - Plumes Bleues
  'aaf01bf5-43fa-4d01-8fc0-7127bd201f94',  -- Draps 4 pièces · 10000 · Drap 4 pièces - Losanges Royal
  '1d281ce4-fbc6-4b04-b066-e00010d07908',  -- Draps 4 pièces · 10000 · Drap 4 pièces - Ikat Bleu
  '3861968d-1a42-4cfd-a253-5199b6ab6f44',  -- Signature · 10000 · Parure 4 pièces - Vagues Ocre
  '164215b0-7000-4ca4-ac2a-cb57e38f8b25',  -- Signature · 10000 · Parure 4 pièces - Floral Jaune Turquoise
  '7fc9eb63-401e-484a-bbb3-b616eec0e590',  -- Signature · 10000 · Parure 4 pièces - Feuilles Turquoise
  'e6c8ad48-0c00-4d9d-8b54-ebb2a57c1030',  -- Signature · 10000 · Parure 4 pièces - Hexagones Marine
  'dae82045-47f5-4cbe-b554-54b6840ff094',  -- Signature · 10000 · Parure 4 pièces - Cœurs Rouges
  '42f9e654-a16c-43ae-a708-0444a70574e4',  -- Signature · 10000 · Parure 4 pièces - Greek Orange
  '5ed0a803-3bde-421f-a683-80e10dc373d8',  -- Signature · 10000 · Parure 4 pièces - Botanique Rose
  '3a1052bf-fcfd-4d02-8ecf-549cf7f79843',  -- Signature · 10000 · Parure 4 pièces - Étoiles Marine
  '1a4fb516-1836-45e0-b23e-4b80b504d7b5',  -- Signature · 10000 · Parure 4 pièces - Roses Lavande
  '9abed0bd-ecbb-4c89-b3d2-e12b3c70d4cb',  -- Signature · 10000 · Parure 4 pièces - Cœurs de Roses
  'a427bfb7-28c1-47a0-93cc-889383be9429'  -- Quatre Pièces · 10000 · Parure 4 pièces — Rose Élégance
);

UPDATE public.products SET collection = 'Parures 4 pièces — 8 500 FCFA' WHERE id IN (
  'e6526075-c4aa-4bb2-bb5b-95dfe91547dd',  -- Quatre Pièces · 8500 · Parure 4 pièces -  Belle Pois Rouges
  'e99c35cc-0077-4a02-b83b-82ddd42a8211',  -- Parure 4 pièces · 8500 · Parure 4 pièces — Losanges Bleu Azur
  'c0946ec0-9aa4-4dbc-a234-ea1a868ab253',  -- Parure 4 pièces · 8500 · Parure 4 pièces — Géométrie Moutarde
  'e8d868e3-d37b-44ad-811e-c9d7a3014ef1',  -- Parure 4 pièces · 8500 · Parure 4 pièces — Feuillage Orange
  'bc1f01b1-004d-4e02-94ae-3a3accd57ba7',  -- Parure 4 pièces · 8500 · Parure 4 pièces — Cercles Corail
  '58628210-bb41-4dd7-969d-0745ce90c4c4',  -- Parure 4 pièces · 8500 · Parure 4 pièces — Pois Multicolores
  '0e67cc80-43f8-43ed-8ada-f65979d2274b',  -- Parure 4 pièces · 8500 · Parure 4 pièces — Rayures Marine
  '14e4f728-e4b7-4bc8-bdcc-57d5a7e15654',  -- Parure 4 pièces · 8500 · Parure 4 pièces — Tulipes Printanières
  'd626d8a8-ae35-4daf-88a7-00ded5ad3929',  -- Parure 4 pièces · 8500 · Parure 4 pièces — Spirales Lavande
  '69ba36c5-c1d5-4f1f-9bf8-e3d55d0ab6d1'  -- Parure 4 pièces · 8500 · Parure 4 pièces — Turquoise Abstrait
);

COMMIT;

-- Retour arrière (si besoin) :
-- UPDATE public.products p SET collection = b.collection
--   FROM public.products_collections_backup_20261012 b WHERE b.id = p.id;
