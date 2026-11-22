export const DNA_TOPICS = [
  {
    id: 'overview',
    partKey: 'overview',
    title: 'Double Helix Architecture',
    shortLabel: 'Helix Overview',
    category: 'Macro Structure',
    accent: '#38bdf8',
    badge: 'B-DNA Form',
    summary:
      'Deoxyribonucleic acid (DNA) twists into a right-handed double helix made of two antiparallel polynucleotide strands running 5′→3′ and 3′→5′.',
    details:
      'In its classic B-DNA conformation, the helix completes one full 360° turn every ~10.4 base pairs, spanning 3.4 nm in pitch with a uniform 2.0 nm diameter.',
    metrics: [
      { label: 'Helix Diameter', value: '2.0 nm' },
      { label: 'Pitch / Turn', value: '3.4 nm (~10.4 bp)' },
      { label: 'Base Step', value: '0.34 nm' },
      { label: 'Twist Angle', value: '~34.6° / step' },
    ],
    funFact:
      'Stretched end-to-end, the DNA inside a single human cell measures roughly 2 meters—coiled inside a 6-micrometer nucleus.',
    clickHint: 'Click any glowing strand, rung, or bond on the 3D helix to inspect it.',
  },
  {
    id: 'backbone',
    partKey: 'backbone',
    title: 'Sugar-Phosphate Backbone',
    shortLabel: 'Backbone Strands',
    category: 'Structural Rails',
    accent: '#6366f1',
    badge: 'Covalent Phosphodiester',
    summary:
      'Alternating deoxyribose sugars and negatively charged phosphate groups form the resilient outer rails of the double helix.',
    details:
      'Strong covalent phosphodiester bonds link the 3′ carbon of one sugar ring to the 5′ carbon of the next, keeping the hydrophilic exterior stable in water.',
    metrics: [
      { label: 'Bond Type', value: '3′→5′ Phosphodiester' },
      { label: 'Sugar Unit', value: '2′-Deoxyribose' },
      { label: 'Net Charge', value: 'Negative (PO₄⁻)' },
      { label: 'Polarity', value: 'Antiparallel' },
    ],
    funFact:
      'Lacking a reactive 2′-OH group makes DNA far more chemically durable than RNA for long-term genetic storage.',
    clickHint: 'Click the glowing indigo/cyan outer helical rails or phosphate nodes.',
  },
  {
    id: 'at-pair',
    partKey: 'at-pair',
    title: 'Adenine – Thymine (A–T)',
    shortLabel: 'A–T Base Pair',
    category: 'Purine + Pyrimidine',
    accent: '#22d3ee',
    badge: '2 Hydrogen Bonds',
    summary:
      'Adenine (a double-ring purine) pairs selectively with Thymine (a single-ring pyrimidine) across the interior of the helix.',
    details:
      'Pairing one bulky purine with one compact pyrimidine keeps the helix width uniform at 2.0 nm. Two hydrogen bonds bridge A and T.',
    metrics: [
      { label: 'Adenine', value: 'Purine (2 rings)' },
      { label: 'Thymine', value: 'Pyrimidine (1 ring)' },
      { label: 'H-Bonds', value: '2 Bonds' },
      { label: 'Melting Temp', value: 'Lower than G–C' },
    ],
    funFact:
      'Replication origins are rich in A–T pairs because two hydrogen bonds require less energy to unzip.',
    clickHint: 'Click any cyan–amber rung on the 3D helix to highlight A–T base pairs.',
  },
  {
    id: 'gc-pair',
    partKey: 'gc-pair',
    title: 'Guanine – Cytosine (G–C)',
    shortLabel: 'G–C Base Pair',
    category: 'Purine + Pyrimidine',
    accent: '#34d399',
    badge: '3 Hydrogen Bonds',
    summary:
      'Guanine (purine) locks selectively onto Cytosine (pyrimidine) through three hydrogen bonds, adding extra thermal stability.',
    details:
      'Because G–C pairs share three hydrogen bonds and stronger base stacking, GC-rich segments resist heat denaturation much better than AT-rich regions.',
    metrics: [
      { label: 'Guanine', value: 'Purine (2 rings)' },
      { label: 'Cytosine', value: 'Pyrimidine (1 ring)' },
      { label: 'H-Bonds', value: '3 Bonds' },
      { label: 'Stability', value: 'High Thermal' },
    ],
    funFact:
      'Deep-sea hydrothermal microbes often evolve GC-rich genomes so their DNA stays intact at extreme temperatures.',
    clickHint: 'Click any emerald–magenta rung on the 3D helix to highlight G–C pairs.',
  },
  {
    id: 'hydrogen-bonds',
    partKey: 'hydrogen-bonds',
    title: 'Hydrogen Bond Bridges',
    shortLabel: 'Hydrogen Bonds',
    category: 'Reversible Core',
    accent: '#f472b6',
    badge: 'Non-Covalent Links',
    summary:
      'Central electrostatic attractions join opposing nitrogenous bases like precision molecular zipper teeth.',
    details:
      'Individually weak (~10–20× weaker than covalent bonds), millions of hydrogen bonds stabilize DNA collectively while letting helicase unzip strands cleanly.',
    metrics: [
      { label: 'Bond Energy', value: '~8–20 kJ/mol' },
      { label: 'A–T Count', value: '2 Bridges' },
      { label: 'G–C Count', value: '3 Bridges' },
      { label: 'Unzip Enzyme', value: 'DNA Helicase' },
    ],
    funFact:
      'Look closely at the 3D model: A–T rungs show 2 glowing central bridges while G–C rungs display 3.',
    clickHint: 'Click the glowing spheres in the middle of any base-pair rung.',
  },
  {
    id: 'grooves',
    partKey: 'grooves',
    title: 'Major & Minor Grooves',
    shortLabel: 'Helical Grooves',
    category: 'Protein Recognition',
    accent: '#a78bfa',
    badge: '22 Å / 12 Å Channels',
    summary:
      'Asymmetric glycosidic angles along each base pair create an alternating wide Major Groove and narrow Minor Groove.',
    details:
      'Transcription factors slide along the wide 22 Å Major Groove to read the exposed chemical edges of A, T, G, and C without unwinding the helix.',
    metrics: [
      { label: 'Major Groove', value: '2.2 nm (22 Å)' },
      { label: 'Minor Groove', value: '1.2 nm (12 Å)' },
      { label: 'Primary Role', value: 'Protein Binding' },
      { label: 'Geometry', value: 'Asymmetric Twist' },
    ],
    funFact:
      'Regulatory proteins insert alpha-helix fingers directly into the Major Groove to switch specific genes on or off.',
    clickHint: 'Orbit around the helix to compare the wide and narrow helical channels.',
  },
];

export const SEQUENCE_PAIRS = [
  { id: 0, type: 'AT', left: 'A', right: 'T', bonds: 2 },
  { id: 1, type: 'GC', left: 'G', right: 'C', bonds: 3 },
  { id: 2, type: 'GC', left: 'C', right: 'G', bonds: 3 },
  { id: 3, type: 'AT', left: 'T', right: 'A', bonds: 2 },
  { id: 4, type: 'AT', left: 'A', right: 'T', bonds: 2 },
  { id: 5, type: 'GC', left: 'G', right: 'C', bonds: 3 },
  { id: 6, type: 'AT', left: 'A', right: 'T', bonds: 2 },
  { id: 7, type: 'GC', left: 'C', right: 'G', bonds: 3 },
  { id: 8, type: 'GC', left: 'G', right: 'C', bonds: 3 },
  { id: 9, type: 'AT', left: 'T', right: 'A', bonds: 2 },
  { id: 10, type: 'GC', left: 'G', right: 'C', bonds: 3 },
  { id: 11, type: 'AT', left: 'A', right: 'T', bonds: 2 },
  { id: 12, type: 'AT', left: 'T', right: 'A', bonds: 2 },
  { id: 13, type: 'GC', left: 'C', right: 'G', bonds: 3 },
  { id: 14, type: 'GC', left: 'G', right: 'C', bonds: 3 },
  { id: 15, type: 'AT', left: 'A', right: 'T', bonds: 2 },
];

