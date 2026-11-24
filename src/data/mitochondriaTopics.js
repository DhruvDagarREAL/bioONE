export const MITOCHONDRIA_TOPICS = [
  {
    id: 'overview',
    partKey: 'cristae-membrane',
    title: 'Cristae Inner Membrane Architecture',
    shortLabel: 'Cristae Membrane',
    category: 'Membrane Topology',
    accent: '#22d3ee',
    badge: 'Double Phospholipid Bilayer',
    summary:
      'The mitochondrial inner membrane folds into cristae, greatly expanding the surface available for electron transport and ATP synthesis.',
    details:
      'Its phospholipid bilayer separates the matrix from the intermembrane space and embeds the respiratory complexes. Narrow crista junctions shape each compartment while maintaining a continuous, proton-impermeable membrane.',
    metrics: [
      { label: 'Membrane', value: 'Phospholipid Bilayer' },
      { label: 'Topology', value: 'Cristae Folds' },
      { label: 'Compartments', value: 'Matrix ↔ IMS' },
      { label: 'Primary Role', value: 'ETC & ATP Synthesis' },
    ],
    funFact:
      'Highly active cells such as cardiomyocytes pack their mitochondria with dense cristae to support exceptionally high ATP demand.',
    clickHint: 'Click the glowing cristae membrane to inspect its bilayer architecture.',
  },
  {
    id: 'complex-i',
    partKey: 'complex-i',
    title: 'Complex I — NADH Dehydrogenase',
    shortLabel: 'Complex I',
    category: 'ETC Complexes',
    accent: '#34d399',
    badge: '45 Subunits • 4 H⁺ Pumped',
    summary:
      'Complex I accepts electrons from NADH, transfers them to coenzyme Q, and pumps protons into the intermembrane space.',
    details:
      'Its L-shaped structure pairs a membrane arm with a matrix-facing arm containing FMN and iron–sulfur clusters. Electron transfer drives conformational changes that translocate about four protons per NADH oxidized.',
    metrics: [
      { label: 'Electron Donor', value: 'NADH' },
      { label: 'Electron Acceptor', value: 'Coenzyme Q' },
      { label: 'Proton Translocation', value: '~4 H⁺ / NADH' },
      { label: 'Key Cofactors', value: 'FMN • Fe–S Clusters' },
    ],
    funFact:
      'Mammalian Complex I contains 45 subunits and is one of the largest membrane-protein assemblies in the cell.',
    clickHint: 'Click the glowing emerald Complex I to follow electrons from NADH to CoQ.',
  },
  {
    id: 'complex-ii',
    partKey: 'complex-ii',
    title: 'Complex II — Succinate Dehydrogenase',
    shortLabel: 'Complex II',
    category: 'ETC Complexes',
    accent: '#a78bfa',
    badge: '4 Subunits • No H⁺ Pump',
    summary:
      'Complex II links the citric acid cycle to the electron transport chain by transferring electrons from succinate to coenzyme Q.',
    details:
      'Succinate oxidation produces fumarate and reduces FAD at Complex II. Electrons then pass through iron–sulfur clusters to CoQ without directly pumping protons across the membrane.',
    metrics: [
      { label: 'Substrate', value: 'Succinate' },
      { label: 'Product', value: 'Fumarate' },
      { label: 'Electron Carrier', value: 'FAD → CoQ' },
      { label: 'Proton Pumping', value: 'None' },
    ],
    funFact:
      'Complex II is the only electron transport complex that also serves as an enzyme in the citric acid cycle.',
    clickHint: 'Click the indigo Complex II to inspect the FAD-linked entry point into the ETC.',
  },
  {
    id: 'coq-cytc',
    partKey: 'coq-cytc',
    title: 'Mobile Carriers: CoQ & Cytochrome c',
    shortLabel: 'CoQ & Cytochrome c',
    category: 'Electron Carriers',
    accent: '#fbbf24',
    badge: 'Lipophilic & Heme Shuttles',
    summary:
      'Coenzyme Q and cytochrome c physically shuttle electrons between the large respiratory complexes embedded in the inner membrane.',
    details:
      'Hydrophobic CoQ diffuses within the lipid bilayer, carrying electrons from Complexes I and II to Complex III. Heme-containing cytochrome c moves through the intermembrane space and delivers one electron at a time from Complex III to Complex IV.',
    metrics: [
      { label: 'CoQ Capacity', value: '2 e⁻ + 2 H⁺' },
      { label: 'Cytochrome c', value: '1 e⁻ / Heme' },
      { label: 'CoQ Location', value: 'Membrane Interior' },
      { label: 'Cyt c Location', value: 'Intermembrane Space' },
    ],
    funFact:
      'CoQ also participates in antioxidant defense, while cytochrome c released into the cytosol can help trigger apoptosis.',
    clickHint: 'Click the amber CoQ discs or fuchsia cytochrome c carriers to inspect their routes.',
  },
  {
    id: 'complex-iii',
    partKey: 'complex-iii',
    title: 'Complex III — Cytochrome bc₁',
    shortLabel: 'Complex III',
    category: 'ETC Complexes',
    accent: '#f472b6',
    badge: '11 Subunits • Q-Cycle • 4 H⁺',
    summary:
      'Complex III transfers electrons from reduced coenzyme Q to cytochrome c while using the Q-cycle to translocate protons.',
    details:
      'The dimeric complex contains cytochrome b, cytochrome c₁, and a mobile Rieske iron–sulfur domain. For each pair of electrons delivered to cytochrome c, the Q-cycle releases four protons into the intermembrane space.',
    metrics: [
      { label: 'Architecture', value: 'Functional Dimer' },
      { label: 'Electron Input', value: 'QH₂' },
      { label: 'Electron Output', value: 'Reduced Cyt c' },
      { label: 'Proton Translocation', value: '4 H⁺ / 2 e⁻' },
    ],
    funFact:
      'The Rieske domain physically swings between cytochrome b and cytochrome c₁ during each electron-transfer cycle.',
    clickHint: 'Click the fuchsia Complex III dimer to inspect the Q-cycle and Rieske domain.',
  },
  {
    id: 'complex-iv',
    partKey: 'complex-iv',
    title: 'Complex IV — Cytochrome c Oxidase',
    shortLabel: 'Complex IV',
    category: 'ETC Complexes',
    accent: '#fb923c',
    badge: '13 Subunits • O₂ → H₂O • 2 H⁺',
    summary:
      'Complex IV uses electrons from cytochrome c to reduce molecular oxygen to water and contributes to the proton gradient.',
    details:
      'Its copper and heme centers route electrons to a heme a₃–CuB binuclear site where oxygen binds. Two pumped protons per electron pair complement the chemical protons consumed during water formation.',
    metrics: [
      { label: 'Terminal Acceptor', value: 'Molecular O₂' },
      { label: 'Reaction Product', value: 'H₂O' },
      { label: 'Proton Translocation', value: '2 H⁺ / 2 e⁻' },
      { label: 'Metal Centers', value: 'CuA • Heme a • a₃–CuB' },
    ],
    funFact:
      'Cyanide blocks the oxygen-binding site of Complex IV, rapidly halting cellular respiration and ATP production.',
    clickHint: 'Click the orange Complex IV to inspect oxygen reduction and proton pumping.',
  },
  {
    id: 'proton-gradient',
    partKey: 'proton-gradient',
    title: 'Electrochemical Proton Gradient (Δp)',
    shortLabel: 'Proton Gradient',
    category: 'Chemiosmosis',
    accent: '#22d3ee',
    badge: 'ΔΨ ~180mV + ΔpH ~0.5',
    summary:
      'Proton translocation stores respiratory energy as an electrochemical gradient across the mitochondrial inner membrane.',
    details:
      'Complexes I, III, and IV make the intermembrane space more acidic and electrically positive than the matrix. The resulting proton-motive force combines membrane potential and pH difference to drive protons back through ATP synthase.',
    metrics: [
      { label: 'Membrane Potential', value: '~150–180 mV' },
      { label: 'Chemical Gradient', value: 'ΔpH ~0.5–1.0' },
      { label: 'Pumping Sites', value: 'Complexes I • III • IV' },
      { label: 'Stored Force', value: 'Proton-Motive Force' },
    ],
    funFact:
      'The inner membrane is normally highly impermeable to protons, allowing a tiny ion gradient to store usable cellular energy.',
    clickHint: 'Click the glowing proton field above the membrane to inspect the gradient.',
  },
  {
    id: 'atp-synthase',
    partKey: 'atp-synthase',
    title: 'Rotary ATP Synthase (Complex V)',
    shortLabel: 'ATP Synthase',
    category: 'ATP Synthesis',
    accent: '#34d399',
    badge: 'F₀ Rotor + F₁ Knob • 3 ATP/rot',
    summary:
      'ATP synthase couples proton return through its membrane rotor to mechanical rotation and chemical ATP synthesis in the matrix.',
    details:
      'Protons crossing the F₀ c-ring rotate the central γ stalk inside the F₁ α₃β₃ catalytic head. Sequential open, loose, and tight β-subunit states bind ADP and phosphate, form ATP, and release it in roughly 120° steps.',
    metrics: [
      { label: 'Catalytic Cycle', value: '~120° Steps' },
      { label: 'ATP Output', value: '~3 ATP / Revolution' },
      { label: 'Substrates', value: 'ADP + Pi' },
      { label: 'Rotating Parts', value: 'c-ring • γ Stalk' },
    ],
    funFact:
      'ATP synthase is a reversible molecular motor: under suitable conditions it can hydrolyze ATP and rotate in the opposite direction.',
    clickHint: 'Click the rotating emerald ATP synthase to inspect its F₀ rotor and F₁ head.',
  },
  {
    id: 'energy-yield',
    partKey: 'energy-yield',
    title: 'Net ATP Yield & Metabolic Regulation',
    shortLabel: 'ATP Yield & Control',
    category: 'Bioenergetics',
    accent: '#a78bfa',
    badge: '~2.5 ATP/NADH • ~1.5 ATP/FADH₂',
    summary:
      'Respiratory ATP yield reflects proton stoichiometry, transport costs, substrate supply, oxygen availability, and cellular energy demand.',
    details:
      'Mitochondrial NADH yields about 2.5 ATP, while electrons entering through FADH₂ bypass Complex I and yield about 1.5 ATP. Respiration accelerates when ADP is available and slows when ATP accumulates or oxygen becomes limiting.',
    metrics: [
      { label: 'NADH Yield', value: '~2.5 ATP' },
      { label: 'FADH₂ Yield', value: '~1.5 ATP' },
      { label: 'Glucose Yield', value: '~30–32 ATP' },
      { label: 'Key Regulation', value: 'ADP • O₂ • Substrates' },
    ],
    funFact:
      'A typical person turns over roughly their own body mass in ATP each day, continuously recycling ADP rather than storing that much ATP.',
    clickHint: 'Click the ATP output stream to inspect energetic yield and respiratory regulation.',
  },
];

export const MITOCHONDRIA_SEQUENCE = [
  { id: 'complex-i', partKey: 'complex-i', position: [-4.5, 0, 0] },
  { id: 'complex-ii', partKey: 'complex-ii', position: [-2.7, -1, 0] },
  { id: 'coq-cytc', partKey: 'coq-cytc', position: [-1, 0.2, 0] },
  { id: 'complex-iii', partKey: 'complex-iii', position: [0.8, 0, 0] },
  { id: 'complex-iv', partKey: 'complex-iv', position: [2.8, 0, 0] },
  { id: 'atp-synthase', partKey: 'atp-synthase', position: [4.7, -0.8, 0] },
];
