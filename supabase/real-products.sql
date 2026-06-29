-- ============================================================
-- VRAIS PRODUITS DAVIS SONO SHOP — à coller dans Supabase SQL
-- https://supabase.com/dashboard/project/mswvuhjzpbwjloorczdv/sql/new
-- ============================================================

-- 1. Supprimer les produits placeholder
DELETE FROM products;

-- 2. Insérer les vrais produits avec photos réelles
INSERT INTO products (name, slug, short_description, description, price, category, stock, stock_alert, images, badge, is_active, views) VALUES

-- ═══════════════ ENCEINTES ═══════════════

('Electro-Voice EV Subwoofer Double 18"', 'ev-subwoofer-double-18',
 'Caisson de basse professionnel double 18 pouces',
 'Caisson de basse professionnel Electro-Voice double 18 pouces. Puissance de grave exceptionnelle pour concerts et événements. Idéal pour renforcer les basses fréquences en sonorisation.',
 850000, 'enceintes', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.22.jpg','https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.23.jpg'],
 'hot', true, 0),

('Electro-Voice EV Enceintes 2×12"', 'ev-enceintes-2x12',
 'Paire d''enceintes Electro-Voice double 12 pouces',
 'Paire d''enceintes Electro-Voice double 12 pouces. Construction robuste, son clair et puissant. Idéales pour la sonorisation de salles moyennes et grandes.',
 1200000, 'enceintes', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.22-1.jpg','https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.25.jpg'],
 'hot', true, 0),

('JBL SRX725 Enceintes Double 15"', 'jbl-srx725',
 'Paire d''enceintes JBL SRX725 double 15 pouces',
 'Paire d''enceintes JBL SRX725 double 15 pouces. Son cristallin et puissant adapté aux concerts et événements professionnels. Performance sonore exceptionnelle.',
 1800000, 'enceintes', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.01.jpg'],
 'new', true, 0),

('Système Line Array Professionnel', 'systeme-line-array',
 'Système line array professionnel pour grandes salles',
 'Système de sonorisation line array professionnel. Configuration idéale pour grandes salles, concerts et événements en plein air. Son homogène sur toute la zone de couverture.',
 3500000, 'enceintes', 1, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.42.jpg','https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.37-1.jpg'],
 'hot', true, 0),

-- ═══════════════ MIXAGE ═══════════════

('Allen & Heath ZED-24 Table de mixage 24 canaux', 'allen-heath-zed-24',
 'Table de mixage professionnelle Allen & Heath 24 canaux',
 'Table de mixage professionnelle Allen & Heath ZED-24, 24 canaux. Préamplis de haute qualité, EQ 3 bandes par canal, effets intégrés. Idéale pour enregistrement studio et live.',
 950000, 'mixage', 1, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.14.jpg'],
 'hot', true, 0),

('Yamaha MG16XU Table de mixage 16 canaux', 'yamaha-mg16xu',
 'Table de mixage Yamaha 16 canaux USB avec effets SPX',
 'Table de mixage Yamaha MG16XU 16 canaux avec effets SPX et interface USB. 10 préamplis micro D-PRE, compression 1 touche. Parfaite pour les scènes live et le home studio.',
 580000, 'mixage', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.12-2.jpg'],
 NULL, true, 0),

('Yamaha MG24XU Table de mixage 24 canaux', 'yamaha-mg24xu',
 'Table de mixage Yamaha 24 canaux USB avec effets SPX',
 'Table de mixage Yamaha MG24XU 24 canaux avec USB et effets SPX embarqués. 16 préamplis D-PRE. Solution complète pour les concerts et grandes productions.',
 850000, 'mixage', 1, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.24.jpg'],
 NULL, true, 0),

('Yamaha MG32/14FX Table de mixage 32 canaux', 'yamaha-mg32-14fx',
 'Console de mixage Yamaha 32 canaux avec effets SPX premium',
 'Console de mixage Yamaha MG32/14FX 32 canaux. 24 préamplis D-PRE ultra-haute impédance, 14 bus, effets SPX premium. La solution professionnelle pour les grandes productions live.',
 1350000, 'mixage', 1, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.08.jpg'],
 'new', true, 0),

('Soundcraft Table de mixage 32 canaux', 'soundcraft-32-canaux',
 'Console de mixage Soundcraft 32 canaux professionnelle',
 'Console de mixage Soundcraft 32 canaux professionnelle. Qualité sonore exceptionnelle, idéale pour les grandes installations et concerts. Robuste et polyvalente.',
 1800000, 'mixage', 1, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.06.jpg'],
 NULL, true, 0),

('Power Mixer 12 canaux amplifié', 'power-mixer-12-canaux',
 'Table de mixage amplifiée 12 canaux tout-en-un',
 'Table de mixage amplifiée 12 canaux. Amplificateur de puissance intégré, effets numériques, solution tout-en-un pour sonorisation de petites et moyennes salles.',
 380000, 'mixage', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.49.jpg'],
 NULL, true, 0),

('DBX 231 Égaliseur Graphique Stéréo 31 bandes', 'dbx-231-egaliser',
 'Égaliseur graphique stéréo DBX 231, 31 bandes par canal',
 'Égaliseur graphique stéréo DBX 231, 31 bandes par canal. Réponse en fréquence ultra-plate, contrôle précis des fréquences. Indispensable pour toute installation professionnelle.',
 180000, 'mixage', 3, 2,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.09.jpg'],
 NULL, true, 0),

('Behringer Ultragraph Pro FBQ6200', 'behringer-fbq6200',
 'Égaliseur graphique stéréo 31 bandes avec FBQ Detection',
 'Égaliseur graphique stéréo Behringer Ultragraph Pro FBQ6200, 31 bandes. Avec FBQ Feedback Detection System, limiteur de crête intégré. Excellent rapport qualité/prix.',
 145000, 'mixage', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.09-1.jpg'],
 NULL, true, 0),

('DBX 234XL Crossover Stéréo 2/3 voies', 'dbx-234xl-crossover',
 'Crossover stéréo DBX 234XL 2 ou 3 voies',
 'Crossover stéréo DBX 234XL. Division du signal en 2 ou 3 voies pour une gestion précise des fréquences. Essentiel pour les systèmes multi-amplifiés.',
 220000, 'mixage', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.12.jpg'],
 NULL, true, 0),

('Peavey CS4000 Amplificateur de Puissance', 'peavey-cs4000',
 'Amplificateur professionnel Peavey CS4000 4000W',
 'Amplificateur de puissance professionnel Peavey CS4000, 4000W total. Deux canaux, conception en mode classe H pour une efficacité maximale. Fiable pour les grandes installations.',
 680000, 'mixage', 1, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.45.jpg'],
 'hot', true, 0),

('Peavey CS3000 Amplificateur de Puissance', 'peavey-cs3000',
 'Amplificateur professionnel Peavey CS3000 3000W',
 'Amplificateur professionnel Peavey CS3000, 3000W total. Classe H, refroidissement par ventilateur. Idéal pour les systèmes de sonorisation exigeants.',
 540000, 'mixage', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.46.jpg'],
 NULL, true, 0),

('Peavey CS2000 Amplificateur de Puissance', 'peavey-cs2000',
 'Amplificateur professionnel Peavey CS2000 2000W',
 'Amplificateur de puissance Peavey CS2000, 2000W en bridge. Deux canaux indépendants, protection contre les surcharges. Construction robuste pour utilisation intensive.',
 380000, 'mixage', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.32-3.jpg'],
 NULL, true, 0),

-- ═══════════════ INSTRUMENTS ═══════════════

('Yamaha PSR-SX900 Clavier Arrangeur Pro', 'yamaha-psr-sx900',
 'Clavier arrangeur haut de gamme Yamaha PSR-SX900 61 touches',
 'Clavier arrangeur haut de gamme Yamaha PSR-SX900, 61 touches. Sons Super Articulation 2, styles musicaux professionnels, écran couleur TFT tactile. La référence pour les musiciens professionnels.',
 1250000, 'instruments', 1, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.03.jpg'],
 'hot', true, 0),

('Yamaha PSR-SX720 Clavier Arrangeur', 'yamaha-psr-sx720',
 'Clavier arrangeur Yamaha PSR-SX720 61 touches',
 'Clavier arrangeur Yamaha PSR-SX720, 61 touches. Sons super réalistes, styles musicaux variés dont afrobeat et highlife, interface USB. Parfait pour la scène et les concerts.',
 850000, 'instruments', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.17.jpg','https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.07.jpg'],
 'hot', true, 0),

('Yamaha PSR-SX700 Clavier Arrangeur', 'yamaha-psr-sx700',
 'Clavier arrangeur Yamaha PSR-SX700 61 touches',
 'Clavier arrangeur Yamaha PSR-SX700, 61 touches. Sons et styles professionnels, connectivité USB. Version compacte et puissante de la gamme SX, idéale pour la scène.',
 680000, 'instruments', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.11.jpg'],
 NULL, true, 0),

('Yamaha PSR-E473 Clavier 61 touches', 'yamaha-psr-e473',
 'Clavier Yamaha PSR-E473 61 touches 758 sons',
 'Clavier Yamaha PSR-E473, 61 touches. 758 sons intégrés, 235 styles, fonction Smart Chord, sortie audio stéréo. Idéal pour débutants et musiciens intermédiaires. Disponible en stock.',
 280000, 'instruments', 5, 2,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.48.jpg','https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.09.jpg','https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.10.jpg'],
 'new', true, 0),

('Tama Imperialstar Batterie Acoustique', 'tama-imperialstar',
 'Kit de batterie acoustique Tama Imperialstar complet',
 'Kit de batterie acoustique Tama Imperialstar complet. Coques en bouleau et basswood, hardware chromé inclus. Le choix parfait pour les batteurs sérieux souhaitant un son professionnel.',
 780000, 'instruments', 1, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.33.jpg'],
 'hot', true, 0),

('Yamaha Stage Custom Batterie Acoustique', 'yamaha-stage-custom',
 'Kit de batterie Yamaha Stage Custom complet',
 'Kit de batterie Yamaha Stage Custom. Coques en érable birch hybride, son polyvalent et percutant. Idéale pour les concerts, répétitions et enregistrements studio.',
 680000, 'instruments', 1, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.33-1.jpg'],
 NULL, true, 0),

('Pearl Roadshow Batterie Acoustique Complète', 'pearl-roadshow',
 'Kit de batterie Pearl Roadshow avec hardware et cymbales',
 'Kit de batterie Pearl Roadshow complet avec hardware et cymbales. Coques en peuplier, matériau de qualité à prix accessible. Le pack idéal pour débuter avec une marque professionnelle.',
 480000, 'instruments', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.34.jpg','https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.34-1.jpg'],
 NULL, true, 0),

('Meinl Congas Professionnelles', 'meinl-congas',
 'Paire de congas Meinl professionnelles fibre de verre',
 'Paire de congas Meinl professionnelles. Construction en fibre de verre haute résistance, peaux de buffle naturelles. Son chaleureux et projection exceptionnelle pour musiques africaines et latines.',
 350000, 'instruments', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.13.jpg'],
 NULL, true, 0),

('Ibanez Basse Électrique 4 cordes', 'ibanez-basse-4-cordes',
 'Basse électrique Ibanez 4 cordes active noire',
 'Basse électrique Ibanez 4 cordes noire. Manche fin et rapide, micros puissants, électronique active. Parfaite pour les bassistes cherchant polyvalence et confort de jeu.',
 380000, 'instruments', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.26.jpg'],
 NULL, true, 0),

('Squier Jazz Bass 4 cordes Sunburst', 'squier-jazz-bass',
 'Basse électrique Squier Jazz Bass sunburst Fender',
 'Basse électrique Squier Jazz Bass sunburst. Son Jazz Bass classique Fender à prix accessible, manche confortable, deux micros simple bobinage. Idéale pour tous styles musicaux.',
 280000, 'instruments', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.28.jpg','https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.28-1.jpg'],
 NULL, true, 0),

('Guitare Électrique Stratocaster Rouge', 'guitare-electrique-strat-rouge',
 'Guitare électrique style Stratocaster rouge 3 micros',
 'Guitare électrique style Stratocaster rouge. Corps en tilleul, manche en érable, 3 micros simple bobinage. Son Strat classique polyvalent pour tous styles : rock, blues, funk.',
 220000, 'instruments', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.44.jpg'],
 NULL, true, 0),

('Marshall MB Series Ampli Basse', 'marshall-mb-ampli-basse',
 'Amplificateur basse Marshall MB Series 2 canaux',
 'Amplificateur basse Marshall MB Series. Son chaud et punchy typique Marshall, deux canaux Modern/Classic, compresseur intégré, sortie casque. Pour bassistes exigeants.',
 280000, 'instruments', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.47.jpg'],
 NULL, true, 0),

('Roland KC Amplificateur Clavier Stéréo', 'roland-kc-ampli-clavier',
 'Amplificateur stéréo Roland KC pour clavier et voix',
 'Amplificateur stéréo Roland KC pour clavier. Son large et naturel, plusieurs entrées, idéal pour claviers, voix et instruments acoustiques amplifiés sur scène.',
 320000, 'instruments', 1, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.05.jpg'],
 NULL, true, 0),

('Peavey Bandit 112 Ampli Guitare', 'peavey-bandit-112',
 'Amplificateur guitare Peavey Bandit 112 haut-parleur 12"',
 'Amplificateur guitare Peavey Bandit 112, haut-parleur 12 pouces. Deux canaux clean/lead, réverbe à ressort, son américain puissant. Le choix des guitaristes professionnels.',
 250000, 'instruments', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.31.jpg'],
 NULL, true, 0),

('Trombone Si bémol Professionnel', 'trombone-si-bemol',
 'Trombone professionnel en si bémol laiton jaune',
 'Trombone professionnel en si bémol. Coulisse fluide, pavillon en laiton jaune, sonorité riche et puissante. Idéal pour les ensembles de jazz, fanfares et orchestres.',
 180000, 'instruments', 1, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.13-1.jpg'],
 NULL, true, 0),

('Violon 4/4 Professionnel', 'violon-4-4',
 'Violon 4/4 taille adulte épicéa massif',
 'Violon 4/4 taille adulte. Table en épicéa massif, dos et éclisses en érable. Sonorité chaleureuse et équilibrée, idéal pour les élèves avancés et les musiciens professionnels.',
 120000, 'instruments', 1, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.50.jpg'],
 NULL, true, 0),

-- ═══════════════ ACCESSOIRES ═══════════════

('Pédale de Grosse Caisse Griffin', 'pedale-grosse-caisse-griffin',
 'Pédale de grosse caisse Griffin simple acier robuste',
 'Pédale de grosse caisse Griffin simple. Construction en acier robuste, réglage de tension du ressort, plateau antidérapant. Compatible avec toutes les caisses de batterie standard.',
 45000, 'accessoires', 5, 2,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.43-1.jpg'],
 NULL, true, 0),

('Pied de Caisse Claire Réglable', 'pied-caisse-claire',
 'Support de caisse claire professionnel hauteur réglable',
 'Support de caisse claire professionnel. Hauteur réglable, système de blocage rapide, pieds antidérapants. Compatible avec toutes les caisses claires standard de 10" à 14".',
 25000, 'accessoires', 5, 2,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.43.jpg'],
 NULL, true, 0),

('Rack Flightcase DJ Professionnel', 'rack-flightcase-dj',
 'Rack flightcase DJ pour transport de matériel audio',
 'Rack flightcase DJ pour transport et protection de matériel audio. Revêtement robuste, roulettes et poignées de transport. Idéal pour les DJs et techniciens son en déplacement.',
 150000, 'accessoires', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.12-1.jpg'],
 NULL, true, 0),

('Générateur KEMAGE KM6500 6500W', 'generateur-kemage-km6500',
 'Générateur électrique KEMAGE KM6500 6500W démarrage élec.',
 'Générateur électrique KEMAGE KM6500, 6500W. Moteur fiable, démarrage électrique, réservoir grande capacité. Idéal pour alimenter du matériel sonore lors d''événements en plein air.',
 850000, 'accessoires', 2, 1,
 ARRAY['https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.02.jpg'],
 'new', true, 0);
