-- ============================================================
-- Davis Sono Shop — Catalogue complet (52 produits, 90 photos)
-- Coller dans : https://supabase.com/dashboard/project/mswvuhjzpbwjloorczdv/sql/new
-- ============================================================

TRUNCATE products RESTART IDENTITY CASCADE;

INSERT INTO products (name, slug, short_description, description, price, rental_price_day, category, stock, stock_alert, images, badge, is_active, is_rentable, views) VALUES

-- ============================================================
-- SONORISATION PRO
-- ============================================================
(
  'EV Subwoofer Double 18"',
  'ev-subwoofer-double-18',
  'Caisson de basses double 18" Electro-Voice, puissance pro pour grandes salles',
  'Subwoofer professionnel Electro-Voice double 18 pouces. Idéal pour les sonos de grande puissance, concerts, événements en plein air. Construction robuste, excellent rendement en basses fréquences.',
  850000, 35000,
  'sonorisation', 3, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.22.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.23.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.23-1.jpg'
  ],
  'hot', true, true, 0
),
(
  'EV Enceinte 2x12"',
  'ev-enceinte-2x12',
  'Enceinte plein-air Electro-Voice double 12", son cristallin et puissant',
  'Enceinte professionnelle Electro-Voice à double haut-parleur 12 pouces. Conception légère et robuste, parfaite pour la sonorisation d''événements, mariages, conférences et concerts.',
  650000, 25000,
  'sonorisation', 4, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.22-1.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.44-1.jpg'
  ],
  NULL, true, true, 0
),
(
  'EV Enceintes Passives',
  'ev-enceintes-passives',
  'Enceintes passives Electro-Voice, idéales complément de système sono complet',
  'Enceintes passives Electro-Voice disponibles en stock. Compatible avec tous les amplificateurs de puissance professionnels. Excellente fidélité sonore pour applications fixes ou mobiles.',
  450000, 18000,
  'sonorisation', 6, 2,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.25.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.24-1.jpg'
  ],
  NULL, true, true, 0
),
(
  'Système Line Array Professionnel',
  'systeme-line-array-pro',
  'Système line array complet pour concerts et grands événements',
  'Système de sonorisation line array professionnel pour concerts, festivals et grands événements. Couverture homogène sur longue distance, intelligibilité maximale. Idéal pour les salles de plus de 500 personnes.',
  1800000, 85000,
  'sonorisation', 1, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.42.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.37-1.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.23-2.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.23-3.jpg'
  ],
  'hot', true, true, 0
),
(
  'JBL SRX725 Enceinte 2 voies',
  'jbl-srx725',
  'Enceinte passive JBL SRX725 double 15" + compression, référence pro',
  'Enceinte professionnelle JBL SRX725, double 15 pouces + driver à compression. Référence incontournable pour la sono événementielle. Puissance de 800W RMS, réponse en fréquence étendue.',
  950000, 40000,
  'sonorisation', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.01.jpg'
  ],
  NULL, true, true, 0
),
(
  'NEXO PS10 Enceinte Professionnelle',
  'nexo-ps10',
  'Enceinte professionnelle NEXO PS10, compacte et très puissante',
  'Enceinte professionnelle NEXO PS10, référence mondiale pour les applications live et installation fixe. Compacte, légère et très puissante. Idéale pour retour de scène et diffusion principale.',
  750000, 30000,
  'sonorisation', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.35.jpg'
  ],
  'new', true, true, 0
),
(
  'JBL Monitor de Scène',
  'jbl-monitor-scene',
  'Wedge monitor de scène JBL pour retour musiciens, son précis et puissant',
  'Monitor de scène JBL en configuration wedge incliné. Parfait pour le retour artiste sur scène. Son précis et naturel, résistant aux conditions de scène. Compatible XLR et jack 6.35mm.',
  380000, 15000,
  'sonorisation', 3, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.35-1.jpg'
  ],
  NULL, true, true, 0
),
(
  'Sound Town Système Sub + Satellite',
  'sound-town-sub-satellite',
  'Système sono complet Sound Town : subwoofer + satellite sur colonne, prêt à l''emploi',
  'Système de sonorisation complet Sound Town incluant subwoofer et enceinte satellite montée sur colonne. Solution clé en main pour événements, DJ, bars et restaurants. Installation rapide et son professionnel.',
  680000, 28000,
  'sonorisation', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.36.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.37.jpg'
  ],
  'new', true, true, 0
),

-- ============================================================
-- MIXEURS, EQ, PROCESSEURS
-- ============================================================
(
  'Allen & Heath ZED-24 Console',
  'allen-heath-zed-24',
  'Console de mixage Allen & Heath ZED-24 analogique 24 canaux, qualité studio',
  'Console de mixage professionnelle Allen & Heath ZED-24, 24 canaux avec préamplis micro de haute qualité. Idéale pour le live et le studio. EQ 3 bandes, départs effets, connexions USB intégrées.',
  950000, 38000,
  'mixeurs', 1, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.14.jpg'
  ],
  NULL, true, true, 0
),
(
  'Soundcraft Signature 22 Console',
  'soundcraft-signature-22',
  'Console Soundcraft Signature 22 canaux avec effets Lexicon intégrés',
  'Console de mixage professionnelle Soundcraft Signature 22, 22 canaux avec effets numériques Lexicon intégrés. Préamplis Ghost Heritage, interface USB pour enregistrement. Qualité sonore broadcast.',
  850000, 34000,
  'mixeurs', 1, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.06.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.06-1.jpg'
  ],
  'new', true, true, 0
),
(
  'Yamaha MG32/14FX Console',
  'yamaha-mg32-14fx',
  'Grande console Yamaha MG32 avec 32 canaux et effets intégrés',
  'Console de mixage Yamaha MG32/14FX, 32 canaux d''entrée dont 16 micro/ligne. 14 bus de mixage, effets SPX numériques intégrés. Idéale pour grandes productions live et installations fixes.',
  980000, 42000,
  'mixeurs', 1, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.08.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.08-1.jpg'
  ],
  NULL, true, true, 0
),
(
  'Yamaha MG24XU Console',
  'yamaha-mg24xu',
  'Console Yamaha MG24XU 24 canaux avec USB et effets SPX',
  'Console de mixage professionnelle Yamaha MG24XU, 24 canaux avec interface USB et effets SPX numériques. Préamplis D-PRE de qualité exceptionnelle. Parfaite pour spectacles vivants et diffusion.',
  750000, 30000,
  'mixeurs', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.24.jpg'
  ],
  NULL, true, true, 0
),
(
  'Yamaha MG16XU Console',
  'yamaha-mg16xu',
  'Console Yamaha MG16XU 16 canaux compacte avec USB et effets',
  'Console de mixage Yamaha MG16XU, 16 canaux avec 4 bus auxiliaires. Effets numériques SPX, interface USB pour enregistrement direct. Préamplis D-PRE de haute qualité, construction ultra-robuste.',
  580000, 24000,
  'mixeurs', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.12-2.jpg'
  ],
  NULL, true, true, 0
),
(
  'Yamaha MG12XU Console',
  'yamaha-mg12xu',
  'Console compacte Yamaha MG12XU 12 canaux, USB et effets intégrés',
  'Console de mixage compacte Yamaha MG12XU, 12 canaux dont 4 micro/ligne avec préamplis D-PRE. Interface USB stéréo, effets SPX numériques. Idéale pour petites scènes, répétitions et enregistrement.',
  420000, 18000,
  'mixeurs', 3, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.27-2.jpg'
  ],
  'new', true, true, 0
),
(
  'Yamaha MG10XU Console',
  'yamaha-mg10xu',
  'Mini console Yamaha MG10XU 10 canaux, USB et effets pour petits setups',
  'Console de mixage compacte Yamaha MG10XU, 10 canaux. Préamplis D-PRE de qualité professionnelle, effets SPX, interface USB. Solution idéale pour DJ, musiciens solo et petits événements.',
  350000, 14000,
  'mixeurs', 4, 2,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.27-3.jpg'
  ],
  NULL, true, true, 0
),
(
  'Power Mixer Amplifié',
  'power-mixer-amplifie',
  'Console amplifiée tout-en-un, solution complète pour sono légère',
  'Power mixer professionnel combinant table de mixage et amplificateur de puissance en un seul appareil. Solution tout-en-un idéale pour petits événements, bars, restaurants. Entrées micro/ligne, effets intégrés.',
  480000, 20000,
  'mixeurs', 3, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.49.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.49-1.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.49-2.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.49-3.jpg'
  ],
  NULL, true, true, 0
),
(
  'DBX 231 Egalisseur Graphique',
  'dbx-231-eq',
  'Egaliseur graphique stéréo DBX 231 à 31 bandes, précision pro',
  'Egaliseur graphique stéréo professionnel DBX 231, 31 bandes par canal (ISO 1/3 octave). Traitement dual-mono ou stéréo, plage de +-12 dB par bande. Standard de l''industrie pour la correction acoustique.',
  185000, NULL,
  'mixeurs', 5, 2,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.09.jpg'
  ],
  NULL, true, false, 0
),
(
  'Behringer FBQ6200 Egalisseur',
  'behringer-fbq6200',
  'Egaliseur stéréo Behringer FBQ6200 avec détecteur de feedback intégré',
  'Egaliseur graphique stéréo Behringer FBQ6200 à 31 bandes avec détecteur de feedback FBQ. Parfait pour éliminer les effets Larsen et optimiser le son en live. 2U rack, construction solide.',
  220000, NULL,
  'mixeurs', 4, 2,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.09-1.jpg'
  ],
  NULL, true, false, 0
),
(
  'DBX 234XL Crossover Actif',
  'dbx-234xl',
  'Crossover actif stéréo DBX 234XL, division de fréquences précise',
  'Processeur crossover actif stéréo DBX 234XL avec division 2 et 3 voies. Filtres de précision Linkwitz-Riley 24 dB/oct. Indispensable pour les systèmes bi-amplifié et tri-amplifié professionnels.',
  165000, NULL,
  'mixeurs', 5, 2,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.12.jpg'
  ],
  NULL, true, false, 0
),

-- ============================================================
-- AMPLIFICATEURS DE PUISSANCE
-- ============================================================
(
  'Peavey CS4000 Ampli de Puissance',
  'peavey-cs4000',
  'Ampli de puissance professionnel Peavey CS4000, 4000W bridgé',
  'Amplificateur de puissance professionnel Peavey CS4000, puissance de 2x2000W sous 4 ohms ou 4000W bridgé. Construction rack 2U ultra-robuste. Idéal pour subwoofers et systèmes de grande puissance.',
  750000, 28000,
  'amplificateurs', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.45.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.44-3.jpg'
  ],
  NULL, true, true, 0
),
(
  'Peavey CS3000 Ampli de Puissance',
  'peavey-cs3000',
  'Ampli de puissance Peavey CS3000, 3000W bridgé, fiabilité légendaire',
  'Amplificateur de puissance professionnel Peavey CS3000, puissance de 2x1500W sous 4 ohms ou 3000W bridgé. Protection complète contre les courts-circuits et la surchauffe. Standard pro pour scènes exigeantes.',
  650000, 25000,
  'amplificateurs', 3, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.46.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.44-2.jpg'
  ],
  NULL, true, true, 0
),
(
  'Peavey CS2000 Ampli de Puissance',
  'peavey-cs2000',
  'Ampli de puissance Peavey CS2000, 2000W bridgé, rapport qualité-prix imbattable',
  'Amplificateur de puissance professionnel Peavey CS2000, puissance de 2x1000W sous 4 ohms ou 2000W bridgé. Refroidissement à convection, rack 2U. Très apprécié pour les setups de sono en Afrique.',
  550000, 22000,
  'amplificateurs', 3, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.32-3.jpg'
  ],
  NULL, true, true, 0
),
(
  'Peavey KB5 Ampli Clavier',
  'peavey-kb5',
  'Ampli clavier Peavey KB5 150W, 2x15" + tweeter, polyvalent et puissant',
  'Amplificateur clavier professionnel Peavey KB5, 150 watts RMS, haut-parleurs double 15" + tweeter à compression. 3 canaux indépendants avec EQ. Idéal pour claviers, machines à rythme et playback.',
  380000, 15000,
  'amplificateurs', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.32.jpg'
  ],
  'new', true, true, 0
),
(
  'Peavey TNT 115 Ampli Basse',
  'peavey-tnt-115',
  'Ampli basse Peavey TNT 115, 200W sur 15", son profond et punchy',
  'Amplificateur combo basse Peavey TNT 115, puissance de 200W sur haut-parleur 15 pouces. Préampli avec EQ 4 bandes, égaliseur graphique, compresseur intégré. Le standard des bassistes pro en Afrique.',
  350000, 14000,
  'amplificateurs', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.32-1.jpg'
  ],
  NULL, true, true, 0
),
(
  'Peavey Combo 115 Ampli Basse',
  'peavey-combo-115',
  'Combo basse Peavey 115, ampli compact et puissant pour scène et répétition',
  'Ampli combo basse Peavey 115 pouces. EQ multi-bandes, effets intégrés. Robustesse Peavey légendaire. Convient aux bassistes de tous niveaux pour concerts et répétitions.',
  420000, 17000,
  'amplificateurs', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.46-1.jpg'
  ],
  NULL, true, true, 0
),
(
  'Peavey Bandit 115 Ampli Guitare',
  'peavey-bandit-115',
  'Ampli guitare Peavey Bandit 115, 100W sur 15", polyvalent rock à jazz',
  'Amplificateur combo guitare Peavey Bandit 115, 100W sur haut-parleur Sheffield 15 pouces. Deux canaux (clean/lead), réverbe à ressort, boucle d''effets. Convient tous styles, du clean cristallin au crunch.',
  320000, 13000,
  'amplificateurs', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.32-2.jpg'
  ],
  NULL, true, true, 0
),
(
  'Peavey Bandit 112 Ampli Guitare',
  'peavey-bandit-112',
  'Ampli guitare Peavey Bandit 112, 80W sur 12", le classique indestructible',
  'Amplificateur combo guitare Peavey Bandit 112, 80W RMS sur haut-parleur Sheffield 12 pouces. Deux canaux avec boost, réverbe numérique. Robustesse Peavey légendaire, idéal pour scène et studio.',
  280000, 12000,
  'amplificateurs', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.31.jpg'
  ],
  NULL, true, true, 0
),
(
  'Marshall MB15 Ampli Basse',
  'marshall-mb15',
  'Ampli basse Marshall MB15, 15W compact pour practice et enregistrement',
  'Amplificateur basse compact Marshall MB15, 15 watts. Deux canaux (clean et overdrive), EQ 3 bandes, sortie casque. Parfait pour practice à domicile, enregistrement studio et répétitions légères.',
  220000, NULL,
  'amplificateurs', 3, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.47.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.47-1.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.47-2.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.47-3.jpg'
  ],
  NULL, true, false, 0
),
(
  'Roland KC Ampli Clavier',
  'roland-kc-ampli',
  'Ampli clavier Roland KC, son stéréo naturel pour tous claviers',
  'Amplificateur clavier Roland KC, conception spéciale pour reproduction fidèle des synthétiseurs, pianos électriques et claviers numériques. Son stéréo clair et naturel, entrées multiples, idéal sur scène.',
  450000, 18000,
  'amplificateurs', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.05.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.05-1.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.05-2.jpg'
  ],
  NULL, true, true, 0
),

-- ============================================================
-- CLAVIERS & SYNTHESISEURS
-- ============================================================
(
  'Yamaha PSR-SX900 Arrangeur Pro',
  'yamaha-psr-sx900',
  'Top arrangeur Yamaha PSR-SX900, son premium et styles musicaux du monde entier',
  'Le fleuron de la gamme arrangeur Yamaha PSR-SX900. 1082 sons, 500 styles dont nombreux styles africains. Ecran couleur tactile, connexion WiFi, micro intégré pour harmonie vocale. Le summum pour les artistes pro.',
  1850000, NULL,
  'claviers', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.03.jpg'
  ],
  'hot', true, false, 0
),
(
  'Yamaha PSR-SX720 Arrangeur',
  'yamaha-psr-sx720',
  'Arrangeur Yamaha PSR-SX720, qualité sonore studio et styles modernes',
  'Arrangeur professionnel Yamaha PSR-SX720, 622 sons de haute qualité, 400 styles musicaux dont zouk, afrobeat, coupé-décalé. Clavier 61 touches sensitives, micro d''harmonie vocale, interface USB.',
  1250000, NULL,
  'claviers', 3, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.17.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.18.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.07.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.07-1.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.07-2.jpg'
  ],
  NULL, true, false, 0
),
(
  'Yamaha PSR-SX700 Arrangeur',
  'yamaha-psr-sx700',
  'Arrangeur Yamaha PSR-SX700, le juste équilibre entre performance et prix',
  'Arrangeur Yamaha PSR-SX700, 622 sons, 400 styles musicaux variés. Micro d''harmonie vocale, connectivité USB, interface intuitive. Parfait équilibre entre qualité professionnelle et accessibilité.',
  980000, NULL,
  'claviers', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.11.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.11-1.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.11-2.jpg'
  ],
  NULL, true, false, 0
),
(
  'Yamaha PSR-E473 Clavier Débutant',
  'yamaha-psr-e473',
  'Clavier d''apprentissage Yamaha PSR-E473, idéal pour débuter ou enseigner',
  'Clavier d''apprentissage Yamaha PSR-E473, 61 touches dynamiques, 622 sons, 205 styles. Fonction Lesson intégrée avec retour lumière sur les touches. USB MIDI, sortie casque, alimentable sur piles.',
  280000, NULL,
  'claviers', 8, 2,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.48.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.48-1.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.48-2.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.09.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.09-1.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.10.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.10-1.jpg'
  ],
  'hot', true, false, 0
),
(
  'Yamaha PSR-620 Arrangeur',
  'yamaha-psr-620',
  'Arrangeur Yamaha PSR-620, sons riches et styles nombreux',
  'Arrangeur Yamaha PSR-620, modèle fiable avec nombreux sons et styles musicaux. Clavier 61 touches, connexion MIDI. Idéal pour musicien cherchant un arrangeur performant à prix accessible.',
  580000, NULL,
  'claviers', 1, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.21.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.21-1.jpg'
  ],
  NULL, true, false, 0
),

-- ============================================================
-- GUITARES & BASSES ELECTRIQUES
-- ============================================================
(
  'Guitare Electrique Stratocaster Rouge',
  'guitare-electrique-strat-rouge',
  'Guitare électrique style Stratocaster rouge, son funky et polyvalent',
  'Guitare électrique style Stratocaster finition rouge, corps en tilleul, manche érable. Trois micros simple bobinage, son clair et brillant. Polyvalente, parfaite pour funk, blues, rock et pop.',
  150000, NULL,
  'guitares', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.44.jpg'
  ],
  NULL, true, false, 0
),
(
  'Ibanez GSR200 Basse Electrique',
  'ibanez-gsr200',
  'Basse électrique Ibanez GSR200, légère et polyvalente, idéale débutants et pros',
  'Basse électrique Ibanez GSR200, corps agathis, manche érable, touche jatoba. 4 cordes, micros Dynamix, son tight et défini. Légère et confortable, parfaite pour tous styles musicaux.',
  180000, NULL,
  'guitares', 3, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.26.jpg'
  ],
  NULL, true, false, 0
),
(
  'Squier Jazz Bass 4 cordes',
  'squier-jazz-bass',
  'Basse Squier Jazz Bass par Fender, son jazz classic, finition sunburst',
  'Basse Squier Jazz Bass par Fender, finition sunburst. Corps aulne, manche érable, touche palissandre. Deux micros single-coil pour le son groove et précis légendaire de Fender.',
  195000, NULL,
  'guitares', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.28.jpg'
  ],
  NULL, true, false, 0
),
(
  'Ibanez SR505 Basse 5 cordes',
  'ibanez-sr505',
  'Basse 5 cordes Ibanez SR505, construction haut de gamme, son moderne',
  'Basse 5 cordes Ibanez SR505, corps mahogany + érable, manche 5 pièces wengé/bubinga. Micros Bartolini MK1, préampli actif 3 bandes. Construction légère et ultra-fine, son défini et articulé.',
  350000, NULL,
  'guitares', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.28-1.jpg'
  ],
  NULL, true, false, 0
),
(
  'Fender Jazz Bass 5 cordes',
  'fender-jazz-bass-5',
  'Basse Fender Jazz Bass 5 cordes, le son intemporel Fender',
  'Basse Fender Jazz Bass 5 cordes, finition classique. Corps aulne, manche érable, touche palissandre. Deux micros Jazz Bass single-coil, son groove et punch légendaire. La référence mondiale des bassistes pro.',
  450000, NULL,
  'guitares', 1, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.28-2.jpg'
  ],
  'new', true, false, 0
),
(
  'Givson Basse avec Etui',
  'givson-basse-etui',
  'Basse Givson 4 cordes avec étui de transport inclus, idéale débutants',
  'Basse électrique Givson 4 cordes livrée avec étui de transport souple. Excellente option pour débuter la basse sans se ruiner. Construction solide, idéale pour apprentissage et premières scènes.',
  85000, NULL,
  'guitares', 3, 2,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.28-3.jpg'
  ],
  'sale', true, false, 0
),
(
  'Basse Electrique Rouge 4 cordes',
  'basse-electrique-rouge',
  'Basse électrique finition rouge, corps précision, son polyvalent',
  'Basse électrique style Precision Bass, finition rouge brillant. Corps massif, manche robuste, micros split-coil. Son warm et punch caractéristique de la P-bass, adapté à tous les styles musicaux.',
  165000, NULL,
  'guitares', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.27.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.27-1.jpg'
  ],
  NULL, true, false, 0
),

-- ============================================================
-- BATTERIES & PERCUSSIONS
-- ============================================================
(
  'Tama Imperialstar Batterie Complete',
  'tama-imperialstar',
  'Batterie complète Tama Imperialstar, 5 fûts, finition pro, son studio',
  'Batterie complète Tama Imperialstar 5 fûts avec cymbales, hardware et siège. Fûts en peuplier/tilleul, coques Accu-Tune. Son équilibré et dynamique idéal pour live et enregistrement studio.',
  850000, 38000,
  'batteries', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.33.jpg'
  ],
  NULL, true, true, 0
),
(
  'Yamaha Stage Custom Batterie',
  'yamaha-stage-custom',
  'Batterie Yamaha Stage Custom Advantage, la référence pro accessible',
  'Batterie Yamaha Stage Custom Advantage 5 fûts, coques en bouleau de haute qualité. Hardware robuste YKS-90. Son chaud et puissant, préférée des batteurs professionnels du monde entier.',
  1250000, 55000,
  'batteries', 1, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.33-1.jpg'
  ],
  'hot', true, true, 0
),
(
  'Yamaha Gigmaker Kit Batterie',
  'yamaha-gigmaker',
  'Kit batterie Yamaha Gigmaker complet, tout inclus pour commencer',
  'Kit batterie Yamaha Gigmaker complet incluant fûts, cymbales, hardware, siège et baguettes. Idéal pour débutants et élèves en école de musique. Qualité Yamaha garantie dès le premier niveau.',
  580000, 25000,
  'batteries', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.33-2.jpg'
  ],
  'new', true, true, 0
),
(
  'Pearl Roadshow Batterie',
  'pearl-roadshow',
  'Batterie Pearl Roadshow complète, entrée de gamme solide et fiable',
  'Batterie complète Pearl Roadshow 5 fûts avec cymbales et hardware inclus. Fûts en poplar, finitions multiples disponibles. Idéale pour débutants sérieux et répétitions régulières.',
  680000, 28000,
  'batteries', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.34.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.34-1.jpg'
  ],
  NULL, true, true, 0
),
(
  'Meinl Congas Professionnelles',
  'meinl-congas',
  'Congas professionnelles Meinl, son africain authentique, finition naturelle',
  'Congas professionnelles Meinl, coques en fibre de verre haute résistance. Son warm et naturel caractéristique des congas cubaines. Peaux synthétiques résistantes à l''humidité, pieds réglables inclus.',
  280000, 12000,
  'batteries', 3, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.13.jpg'
  ],
  NULL, true, true, 0
),
(
  'Griffin Pedales & Stands Batterie',
  'griffin-pedales-stands',
  'Pédales de grosse caisse et stands Griffin, hardware fiable à prix doux',
  'Ensemble hardware batterie Griffin incluant pédales de grosse caisse et stands de cymbales. Construction robuste en acier, réglages précis. Compatible toutes batteries standard.',
  95000, NULL,
  'batteries', 5, 2,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.43-1.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.43.jpg'
  ],
  NULL, true, false, 0
),

-- ============================================================
-- INSTRUMENTS (CUIVRES & CORDES)
-- ============================================================
(
  'Trombone Tenor',
  'trombone',
  'Trombone ténor en laiton, adapté débutants et musiciens intermédiaires',
  'Trombone ténor en laiton, coulisse légère et précise. Livré avec embouchure et étui de transport. Convient aux débutants en école de musique et musiciens intermédiaires.',
  180000, NULL,
  'instruments', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.13-1.jpg'
  ],
  NULL, true, false, 0
),
(
  'Trompette Sib',
  'trompette-sib',
  'Trompette Sib en laiton argenté, idéale apprentissage et musique de chambre',
  'Trompette Sib en laiton à finition argentée, pistons précis et fluides. Livrée avec embouchure 7C et étui. Idéale pour débutants en école de musique, fanfares et ensembles de chambre.',
  165000, NULL,
  'instruments', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.13-2.jpg'
  ],
  'new', true, false, 0
),
(
  'Violon 4/4',
  'violon-4-4',
  'Violon 4/4 taille adulte avec archet et étui, idéal débutants et étudiants',
  'Violon taille 4/4 (adulte), table en épicéa massif, éclisses et fond en érable. Livré avec archet, colophane et étui rigide. Idéal pour débutants en école de musique et étudiants en conservatoire.',
  85000, NULL,
  'instruments', 4, 2,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.50.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.50-1.jpg'
  ],
  NULL, true, false, 0
),

-- ============================================================
-- ACCESSOIRES & EQUIPEMENTS DIVERS
-- ============================================================
(
  'Rack Flightcase Professionnel',
  'rack-flightcase',
  'Rack flightcase 19" résistant pour transport de matériel pro en toute sécurité',
  'Rack flightcase professionnel 19 pouces, aluminium renforcé avec poignées et roulettes. Protection maximale pour le transport de rack d''amplificateurs, processeurs et équipements sensibles.',
  250000, 10000,
  'accessoires', 3, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.23.12-1.jpg'
  ],
  NULL, true, true, 0
),
(
  'KEMAGE Generateur Electrique',
  'kemage-generateur',
  'Générateur KEMAGE silencieux, alimentation de secours pour événements',
  'Générateur électrique KEMAGE, groupe électrogène silencieux et fiable. Indispensable pour les événements en plein air et zones sans alimentation stable. Démarrage électrique, faible consommation.',
  650000, 28000,
  'accessoires', 2, 1,
  ARRAY[
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.02.jpg',
    'https://mswvuhjzpbwjloorczdv.supabase.co/storage/v1/object/public/product-images/15.29.02-1.jpg'
  ],
  NULL, true, true, 0
);
