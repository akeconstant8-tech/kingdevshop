
-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view messages" ON public.messages FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update messages" ON public.messages FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete messages" ON public.messages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- TESTIMONIALS
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  text TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (published = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed testimonials
INSERT INTO public.testimonials (name, location, text, rating) VALUES
('Peniel Djimi', 'Côte d''Ivoire', 'Shalom Homme de Dieu, j''ai reçu le colis, les couleurs sont bien jolies, je suis satisfaite.', 5),
('Kelly Kouame', 'Bouaké', 'Bonsoir tonton excuse moi pour le dérangement à cette heure ci mais je tiens à vous remercier pour l''expédition qui est arrivé à Bouaké et tout y est à l''intérieur encore merci pour la considération et la confiance.', 5),
('Pierre Ettien', 'Côte d''Ivoire', 'J''ai été livré. Si je rentre, je te fais un retour sur la qualité. Shalom.', 5);

-- ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view orders" ON public.orders FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- SITE CONTENT
CREATE TABLE public.site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view site content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can upsert site content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update site content" ON public.site_content FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.site_content (key, value) VALUES
('hero_title', 'KING DEV SHOP'),
('hero_slogan', 'Un sommeil doux et réparateur avec King Dev Shop.'),
('hero_description', 'Découvrez notre collection de draps confortables, pensés pour transformer chaque nuit en un moment de pur bien-être. 🛏️ ✨');
