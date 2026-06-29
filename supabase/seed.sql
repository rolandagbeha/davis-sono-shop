-- ============================================================
-- Davis Sono Shop — Données de départ (12 produits)
-- ============================================================

INSERT INTO products (name, slug, category, short_description, description, specs, price, rental_price_day, images, badge, stock, stock_alert, is_active, is_rentable) VALUES

-- 1. Enceinte JBL PRX815
(
  'Enceinte JBL PRX815 15" 2000W',
  'enceinte-jbl-prx815-15-2000w',
  'enceintes',
  'Enceinte amplifiée 15 pouces 2000W RMS — qualité professionnelle',
  'La JBL PRX815 est une enceinte amplifiée de référence pour les sonos live. Avec ses 2000W de puissance, elle délivre un son puissant et précis adapté aux concerts, soirées et installations fixes. Son DSP intégré permet un réglage fin du son sans matériel externe.',
  '[
    {"label": "Puissance RMS", "value": "2000W"},
    {"label": "Haut-parleur", "value": "15 pouces avec tweeter 1.5 pouces"},
    {"label": "Réponse en fréquence", "value": "35Hz – 20kHz"},
    {"label": "SPL max", "value": "137 dB"},
    {"label": "Entrées", "value": "XLR / Jack TRS 6.35mm"},
    {"label": "Connectivité", "value": "Bluetooth 5.0"},
    {"label": "Poids", "value": "19.5 kg"},
    {"label": "Dimensions", "value": "444 x 706 x 392 mm"}
  ]'::jsonb,
  285000, 25000,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
  'hot', 8, 3, true, true
),

-- 2. Table mixage Yamaha MG20
(
  'Table mixage Yamaha MG20 20 canaux',
  'table-mixage-yamaha-mg20-20-canaux',
  'mixage',
  'Console analogique 20 canaux avec effets SPX intégrés',
  'La Yamaha MG20 est une table de mixage analogique robuste et polyvalente, idéale pour les concerts, iglises et studios. Ses 20 canaux offrent une grande flexibilité pour mixer plusieurs sources simultanément. Les effets SPX intégrés enrichissent le son sans matériel supplémentaire.',
  '[
    {"label": "Canaux", "value": "20 (12 mono + 4 stéréo)"},
    {"label": "Préamplis", "value": "D-PRE (haute qualité Yamaha)"},
    {"label": "Effets", "value": "SPX intégrés (24 programmes)"},
    {"label": "EQ", "value": "4 bandes sur chaque canal"},
    {"label": "Bus", "value": "2 AUX + 2 moniteurs"},
    {"label": "Phantom power", "value": "+48V sur tous les XLR"},
    {"label": "Poids", "value": "6.3 kg"}
  ]'::jsonb,
  195000, NULL,
  ARRAY['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600'],
  NULL, 5, 2, true, false
),

-- 3. Micro Shure SM58
(
  'Micro Shure SM58 Dynamique Voix',
  'micro-shure-sm58-dynamique-voix',
  'micros',
  'Le standard mondial pour les voix en live — résistant et fidèle',
  'Le Shure SM58 est sans doute le microphone le plus vendu au monde pour les performances vocales live. Sa capsule cardiokde rejette le bruit de scène et les retours. Sa construction robuste lui permet de résister aux chutes et à une utilisation intensive quotidienne.',
  '[
    {"label": "Type", "value": "Dynamique, directivité cardioïde"},
    {"label": "Réponse en fréquence", "value": "50Hz – 15kHz"},
    {"label": "Sensibilité", "value": "-54.5 dBV/Pa"},
    {"label": "Impédance", "value": "150 Ohms"},
    {"label": "Connecteur", "value": "XLR 3 broches"},
    {"label": "Poids", "value": "298g"},
    {"label": "Livré avec", "value": "Pince micro + pochette de transport"}
  ]'::jsonb,
  75000, NULL,
  ARRAY['https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600'],
  'new', 20, 5, true, false
),

-- 4. Enceinte Bose L1 Pro32
(
  'Enceinte Bose L1 Pro32 Colonne',
  'enceinte-bose-l1-pro32-colonne',
  'enceintes',
  'Système de diffusion linéaire Bose pour une couverture 180° exceptionnelle',
  'Le Bose L1 Pro32 révolutionne la sonorisation avec son design en colonne et sa technologie de diffusion en arc. Une seule unité peut couvrir jusqu''à 180° pour combler toute une salle sans écho ni zones mortes. Idéal pour les conférences, mariages et petits concerts.',
  '[
    {"label": "Configuration", "value": "Colonne 32 haut-parleurs + sub intégré"},
    {"label": "Puissance", "value": "1120W"},
    {"label": "Couverture", "value": "180° horizontal"},
    {"label": "Connexions", "value": "2x XLR, 2x Jack, Bluetooth ToneMatch"},
    {"label": "Batterie", "value": "Non (secteur uniquement)"},
    {"label": "Poids total", "value": "17 kg (avec sub)"}
  ]'::jsonb,
  520000, 45000,
  ARRAY['https://images.unsplash.com/photo-1495563125611-b4ada06f0168?w=600'],
  'hot', 3, 1, true, true
),

-- 5. Clavier Yamaha PSR-EW425
(
  'Clavier Yamaha PSR-EW425 76 touches',
  'clavier-yamaha-psr-ew425-76-touches',
  'instruments',
  'Clavier 76 touches avec 758 voix et arranger intelligent',
  'Le Yamaha PSR-EW425 est un clavier arrangeur haut de gamme avec 76 touches dynamiques. Ses 758 voix de haute qualité et ses 235 styles d''accompagnement en font l''outil parfait pour les musiciens, les élèves et les performances live.',
  '[
    {"label": "Touches", "value": "76 (dynamiques, sans marteau)"},
    {"label": "Voix", "value": "758 voix AWM"},
    {"label": "Styles", "value": "235 styles d''accompagnement"},
    {"label": "Polyphonie", "value": "48 notes"},
    {"label": "Connexions", "value": "USB MIDI, AUX In/Out, casque"},
    {"label": "Alimentation", "value": "Secteur ou piles (6x AA)"},
    {"label": "Poids", "value": "6.3 kg"}
  ]'::jsonb,
  145000, NULL,
  ARRAY['https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600'],
  'new', 7, 2, true, false
),

-- 6. Console Behringer X32
(
  'Console Behringer X32 32 canaux Numérique',
  'console-behringer-x32-32-canaux-numerique',
  'mixage',
  'Console numérique professionnelle 32 canaux — la référence du live',
  'La Behringer X32 est devenue en quelques années la console numérique de référence pour les productions professionnelles. Avec 32 préamplis MIDAS hérités, 25 bus de mix, un traitement par canal complet et la connectivité réseau, elle offre des capacités dignes des studios haut de gamme à un prix accessible.',
  '[
    {"label": "Canaux d''entrée", "value": "32 (préamplis MIDAS)"},
    {"label": "Bus", "value": "25 mix bus + 8 DCA + 6 matrix"},
    {"label": "Effets intégrés", "value": "8 processeurs stéréo FX"},
    {"label": "Enregistrement", "value": "USB stéréo 2 pistes + carte d''expansion"},
    {"label": "Connectivité", "value": "Ethernet, MIDI, AES50"},
    {"label": "Écran", "value": "TFT couleur 5 pouces"},
    {"label": "Poids", "value": "15 kg"}
  ]'::jsonb,
  875000, NULL,
  ARRAY['https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=600'],
  NULL, 2, 1, true, false
),

-- 7. Pack Lumières DJ 4 têtes LED
(
  'Pack Lumières DJ 4 Têtes Mobiles LED',
  'pack-lumieres-dj-4-tetes-mobiles-led',
  'eclairage',
  'Kit complet 4 têtes mobiles LED RGBW pour animer vos événements',
  'Ce pack d''éclairage DJ professionnel comprend 4 têtes mobiles LED RGBW avec contrôle DMX. Parfait pour les soirées, mariages, boîtes de nuit et événements corporatifs. Les effets de lumière dynamiques et les couleurs vives créent une ambiance spectaculaire.',
  '[
    {"label": "Type", "value": "Tête mobile LED RGBW"},
    {"label": "Puissance par tête", "value": "60W"},
    {"label": "Couleurs", "value": "RGBW (16 millions de couleurs)"},
    {"label": "Protocole", "value": "DMX 512"},
    {"label": "Canaux DMX", "value": "12 canaux par tête"},
    {"label": "Contrôle", "value": "DMX, Auto, Maître-esclave"},
    {"label": "Contenu pack", "value": "4 têtes + câbles DMX + flight case"}
  ]'::jsonb,
  125000, 15000,
  ARRAY['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'],
  'hot', 6, 2, true, true
),

-- 8. Câbles XLR 10m lot 5
(
  'Câbles XLR 10m — Lot de 5 professionnels',
  'cables-xlr-10m-lot-5-professionnels',
  'accessoires',
  'Lot de 5 câbles XLR mâle-femelle haute qualité — 10 mètres',
  'Ces câbles XLR professionnels offrent un blindage haute densité pour éliminer les interférences et un bruit de sol minimal. Idéal pour les connexions entre microphones, enceintes actives et consoles de mixage. Les connecteurs plaqués or garantissent une connexion stable et durable.',
  '[
    {"label": "Longueur", "value": "10 mètres"},
    {"label": "Connecteurs", "value": "XLR mâle/femelle (3 broches)"},
    {"label": "Blindage", "value": "Double blindage haute densité"},
    {"label": "Conducteur", "value": "Cuivre OFC (oxygène free)"},
    {"label": "Quantité", "value": "5 câbles par lot"},
    {"label": "Connecteurs", "value": "Plaqués or"}
  ]'::jsonb,
  28000, NULL,
  ARRAY['https://images.unsplash.com/photo-1558618047-3b07ef0b1fa1?w=600'],
  NULL, 30, 10, true, false
),

-- 9. Guitare Yamaha F310
(
  'Guitare Yamaha F310 Acoustique Folk',
  'guitare-yamaha-f310-acoustique-folk',
  'instruments',
  'Guitare folk acoustique idéale pour débuter ou progresser — corps dreadnought',
  'La Yamaha F310 est la guitare acoustique la plus vendue au monde pour les débutants et les musiciens intermédiaires. Sa table en épicéa et ses éclisses en acajou produisent un son chaleureux et équilibré. Son manche confortable facilite l''apprentissage des accords.',
  '[
    {"label": "Type", "value": "Folk acoustique Dreadnought"},
    {"label": "Table", "value": "Épicéa massif"},
    {"label": "Fond et éclisses", "value": "Acajou"},
    {"label": "Manche", "value": "Nato (équivalent acajou)"},
    {"label": "Cordes", "value": "Acier 6 cordes"},
    {"label": "Mécaniques", "value": "Mécaniques chromées"},
    {"label": "Couleur", "value": "Naturel brillant"},
    {"label": "Livré avec", "value": "Médiators"}
  ]'::jsonb,
  89000, NULL,
  ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600'],
  NULL, 10, 3, true, false
),

-- 10. Subwoofer 18" passif
(
  'Subwoofer 18 Pouces 1200W Passif',
  'subwoofer-18-pouces-1200w-passif',
  'enceintes',
  'Subwoofer passif 18 pouces 1200W — graves puissants pour vos événements',
  'Ce subwoofer 18 pouces passif de 1200W est conçu pour compléter tout système de sonorisation avec des basses profondes et percutantes. Sa construction en contreplaqué birch offre une grande rigidité et durabilité. À utiliser avec un amplificateur puissant pour un résultat optimal.',
  '[
    {"label": "Diamètre haut-parleur", "value": "18 pouces"},
    {"label": "Puissance nominale", "value": "1200W RMS"},
    {"label": "Puissance pic", "value": "2400W"},
    {"label": "Impédance", "value": "8 Ohms"},
    {"label": "Réponse en fréquence", "value": "35Hz – 300Hz"},
    {"label": "SPL max", "value": "135 dB"},
    {"label": "Construction", "value": "Contreplaqué birch 18mm"},
    {"label": "Connecteurs", "value": "2x Speakon NL4"}
  ]'::jsonb,
  340000, 30000,
  ARRAY['https://images.unsplash.com/photo-1594292023566-d14ab1afc3d3?w=600'],
  NULL, 4, 2, true, true
),

-- 11. Micro HF Sennheiser XSW UHF
(
  'Micro HF Sennheiser XSW 1-835 UHF',
  'micro-hf-sennheiser-xsw-1-835-uhf',
  'micros',
  'Système sans fil UHF Sennheiser avec capsule E835 — portée 100m',
  'Le Sennheiser XSW 1-835 offre la qualité sonore Sennheiser en technologie UHF sans fil. Avec une portée de 100 mètres et une latence ultra-faible, il est parfait pour les prédicateurs, animateurs et chanteurs. La capsule E835 garantit un son vocal naturel et articulé.',
  '[
    {"label": "Fréquence", "value": "UHF 548-572 MHz (bande A)"},
    {"label": "Portée", "value": "100 mètres en espace ouvert"},
    {"label": "Latence", "value": "< 3.6 ms"},
    {"label": "Capsule", "value": "Sennheiser E835 (cardioïde dynamique)"},
    {"label": "Autonomie", "value": "5.5 heures (2x AA)"},
    {"label": "Canaux", "value": "12 canaux"},
    {"label": "Contenu", "value": "Émetteur main + récepteur rack + câble XLR"}
  ]'::jsonb,
  210000, NULL,
  ARRAY['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600'],
  'new', 9, 3, true, false
),

-- 12. Batterie Roland TD-07
(
  'Batterie Roland TD-07 Électronique V-Drums',
  'batterie-roland-td-07-electronique-v-drums',
  'instruments',
  'Batterie électronique Roland avec 143 kits de batterie et pads mesh',
  'La Roland TD-07 propose l''expérience de jeu la plus proche d''une vraie batterie acoustique. Ses pads mesh silencieux permettent de jouer à toute heure sans déranger les voisins. Le module TD-07 offre 143 kits de batterie de qualité studio et une connectivité complète pour l''enregistrement.',
  '[
    {"label": "Module", "value": "Roland TD-07 (143 kits)"},
    {"label": "Pads", "value": "Mesh (silencieux, réponse naturelle)"},
    {"label": "Configuration", "value": "5 pièces (crash, ride, hi-hat compris)"},
    {"label": "Connectivité", "value": "USB MIDI, 2x Jack moniteur, casque"},
    {"label": "Enregistrement", "value": "USB MIDI vers DAW"},
    {"label": "Coaching", "value": "Mode entraînement intégré"},
    {"label": "Poids total", "value": "25 kg (avec rack)"}
  ]'::jsonb,
  395000, NULL,
  ARRAY['https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600'],
  NULL, 3, 1, true, false
);
