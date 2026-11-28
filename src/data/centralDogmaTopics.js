export const CENTRAL_DOGMA_TOPICS = [
  {
    id: 'overview',
    partKey: 'central-dogma-flow',
    title: 'The Central Dogma Overview',
    shortLabel: 'Central Dogma Flow',
    category: 'Information Flow',
    accent: '#a78bfa',
    badge: 'DNA → RNA → Protein',
    summary:
      'Genetic information flows from DNA to RNA by transcription and from messenger RNA to protein by translation.',
    details:
      'In eukaryotic cells, RNA polymerase transcribes a gene inside the nucleus. The initial pre-mRNA is processed into mature mRNA before export to the cytoplasm, where ribosomes decode its nucleotide sequence into an amino-acid sequence. The upper and lower regions of this stage deliberately separate those cellular compartments.',
    metrics: [
      { label: 'Information Path', value: 'DNA → RNA → Protein' },
      { label: 'Transcription Product', value: 'Nascent pre-mRNA' },
      { label: 'Translation Product', value: 'Polypeptide' },
      { label: 'Cellular Compartments', value: 'Nucleus → Cytoplasm' },
    ],
    funFact:
      'The central dogma describes sequence-information transfer; it does not mean that every gene is continuously transcribed or that every RNA encodes a protein.',
    clickHint: 'Click the glowing DNA → RNA → Protein guide to inspect the complete information pathway.',
  },
  {
    id: 'promoter-initiation',
    partKey: 'rna-polymerase',
    title: 'Promoter Recognition & Transcription Initiation',
    shortLabel: 'Promoter & Initiation',
    category: 'Transcription',
    accent: '#c4b5fd',
    badge: 'RNA Polymerase II',
    summary:
      'Transcription begins when regulatory proteins and RNA polymerase II assemble at a promoter and open a short region of DNA.',
    details:
      'General transcription factors recognize promoter elements and recruit RNA polymerase II into a pre-initiation complex. Helicase activity associated with TFIIH helps separate the strands, positioning the template in the polymerase active site so RNA synthesis can begin at the transcription start site.',
    metrics: [
      { label: 'Promoter', value: 'Core + Regulatory Elements' },
      { label: 'Polymerase', value: 'RNA Polymerase II' },
      { label: 'Initiation Complex', value: 'Pol II + General Factors' },
      { label: 'Transcription Start', value: '+1 Nucleotide' },
    ],
    funFact:
      'A promoter is not translated into protein: it is a regulatory DNA region that helps determine where and how often transcription starts.',
    clickHint: 'Click the purple RNA polymerase or the amber promoter marker in the nucleus.',
  },
  {
    id: 'mrna-elongation',
    partKey: 'nascent-mrna',
    title: 'RNA Polymerase & 5′→3′ mRNA Elongation',
    shortLabel: 'mRNA Elongation',
    category: 'Transcription',
    accent: '#22d3ee',
    badge: 'Template 3′→5′ • RNA 5′→3′',
    summary:
      'RNA polymerase reads the DNA template 3′→5′ while extending the nascent RNA transcript only at its 3′ end.',
    details:
      'Within the transcription bubble, a short RNA–DNA hybrid holds the newest RNA nucleotides against the template. Incoming ribonucleoside triphosphates pair with template bases—A with U, T with A, G with C, and C with G. The RNA therefore matches the 5′→3′ coding strand in sequence, except that RNA contains U instead of T.',
    metrics: [
      { label: 'Template Polarity', value: 'Read 3′→5′' },
      { label: 'RNA Polarity', value: 'Synthesized 5′→3′' },
      { label: 'Base Pairing', value: 'A–U • T–A • G–C' },
      { label: 'Substrates', value: 'ATP • UTP • GTP • CTP' },
    ],
    funFact:
      'The RNA–DNA hybrid is only about 8–9 base pairs long; the growing RNA separates from DNA as it exits the polymerase.',
    clickHint: 'Click the color-coded nascent transcript emerging from RNA polymerase.',
  },
  {
    id: 'mrna-processing',
    partKey: 'mrna-strand',
    title: '5′ Cap, Poly-A Tail & Intron Splicing',
    shortLabel: 'mRNA Processing',
    category: 'RNA Maturation',
    accent: '#34d399',
    badge: 'Cap • Splice • Poly-A',
    summary:
      'Eukaryotic pre-mRNA receives a 5′ cap and poly-A tail while introns are removed and exons joined to produce mature mRNA.',
    details:
      'A 7-methylguanosine cap is added to the 5′ end, and a poly-A tail is added after 3′ cleavage. The spliceosome removes noncoding introns and ligates coding exons. These modifications support nuclear export, transcript stability, and efficient translation; only the processed mature mRNA enters the cytoplasmic ribosome.',
    metrics: [
      { label: '5′ Modification', value: '7-Methylguanosine Cap' },
      { label: '3′ Modification', value: 'Poly-A Tail' },
      { label: 'Splicing', value: 'Introns Out • Exons Joined' },
      { label: 'Mature Transcript', value: 'Exported mRNA' },
    ],
    funFact:
      'Alternative splicing lets one pre-mRNA produce different mature transcripts by joining its exons in different combinations.',
    clickHint: 'Click the processing markers, capped mature transcript, or codon track to inspect RNA maturation.',
  },
  {
    id: 'ribosome-assembly',
    partKey: 'ribosome',
    title: 'Ribosome Structure',
    shortLabel: '40S + 60S Ribosome',
    category: 'Translation Machinery',
    accent: '#a78bfa',
    badge: '80S • A / P / E Sites',
    summary:
      'The eukaryotic 80S ribosome combines a 60S large subunit and a 40S small subunit around the mature mRNA.',
    details:
      'The 40S subunit supports mRNA decoding, while the 60S subunit contains the peptidyl-transferase center and polypeptide exit tunnel. Three tRNA-binding sites are arranged E–P–A in the direction of ribosome movement: empty tRNAs exit through E, the peptidyl-tRNA occupies P, and incoming aminoacyl-tRNAs enter A.',
    metrics: [
      { label: 'Large Subunit', value: '60S • Catalysis + Exit' },
      { label: 'Small Subunit', value: '40S • mRNA Decoding' },
      { label: 'Decoding Sites', value: 'E → P → A (tRNA Path)' },
      { label: 'Structural RNA', value: 'Ribosomal RNA (rRNA)' },
    ],
    funFact:
      'Ribosomal RNA performs central structural and catalytic roles, making the ribosome a ribozyme rather than simply a protein enzyme.',
    clickHint: 'Click either translucent ribosomal subunit or an A/P/E pocket to inspect the complex.',
  },
  {
    id: 'trna-codons',
    partKey: 'trna',
    title: 'Codon–Anticodon Pairing & Aminoacyl-tRNA',
    shortLabel: 'tRNA & Codons',
    category: 'Molecular Decoding',
    accent: '#22d3ee',
    badge: '3 Bases • 1 Amino Acid',
    summary:
      'Each charged tRNA carries a specific amino acid and uses its anticodon to recognize a complementary three-base mRNA codon.',
    details:
      'The L-shaped tRNA places its anticodon in the small-subunit decoding center and its 3′ CCA acceptor end in the large subunit. Aminoacyl-tRNA synthetases attach the correct amino acid before delivery to the ribosome. Codons are read 5′→3′; antiparallel anticodon pairing preserves the correct reading frame.',
    metrics: [
      { label: 'Anticodon', value: 'Antiparallel Codon Match' },
      { label: 'Amino-Acid Attachment', value: '3′ CCA Acceptor End' },
      { label: 'Charging Enzyme', value: 'Aminoacyl-tRNA Synthetase' },
      { label: 'Reading Frame', value: 'Nonoverlapping Triplets' },
    ],
    funFact:
      'There are 61 sense codons but only 20 standard amino acids; several codons can therefore specify the same amino acid.',
    clickHint: 'Click an L-shaped tRNA or its anticodon bases in the ribosome channel.',
  },
  {
    id: 'peptide-bond',
    partKey: 'peptidyl-center',
    title: 'Peptidyl Transferase & Translocation',
    shortLabel: 'Peptide Bond Formation',
    category: 'Translation Elongation',
    accent: '#fbbf24',
    badge: 'rRNA Catalysis • 1 Codon Step',
    summary:
      'The large-subunit peptidyl-transferase center transfers the growing chain from the P-site tRNA to the A-site amino acid.',
    details:
      'Ribosomal RNA catalyzes nucleophilic attack by the A-site amino group, forming a peptide bond and lengthening the chain by one residue. The P-site tRNA is then deacylated. Translocation moves the ribosome exactly one codon in the mRNA 5′→3′ direction, shifting the peptidyl-tRNA to P and the empty tRNA toward E.',
    metrics: [
      { label: 'Catalytic Center', value: '60S rRNA Ribozyme' },
      { label: 'Bond Formed', value: 'Covalent Peptide Bond' },
      { label: 'Chain Transfer', value: 'P-Site → A-Site tRNA' },
      { label: 'Translocation', value: 'Exactly One Codon' },
    ],
    funFact:
      'No separate protein enzyme forms peptide bonds in the ribosome; the active site is composed primarily of rRNA.',
    clickHint: 'Click the amber catalytic pocket or animated chain-transfer arc inside the 60S subunit.',
  },
  {
    id: 'polypeptide-folding',
    partKey: 'polypeptide-chain',
    title: 'Nascent Polypeptide Chain & Protein Folding',
    shortLabel: 'Chain & Folding',
    category: 'Protein Biogenesis',
    accent: '#34d399',
    badge: 'N → C Synthesis',
    summary:
      'Amino acids join from the N-terminus toward the C-terminus as the nascent chain emerges through the large-subunit exit tunnel.',
    details:
      'Peptide bonds create a repeating covalent backbone with chemically distinct side chains. The distal end of the demonstration chain is its N-terminus, while the newest residue remains near the tunnel at the growing C-terminal end. Local secondary structures, longer-range tertiary contacts, and chaperone-assisted interactions can begin as the chain emerges.',
    metrics: [
      { label: 'Chain Direction', value: 'N-Terminus → C-Terminus' },
      { label: 'Covalent Linkage', value: 'Peptide Bonds' },
      { label: 'Exit Route', value: '60S Exit Tunnel' },
      { label: 'Folding Levels', value: 'Secondary → Tertiary' },
    ],
    funFact:
      'Folding can begin before synthesis finishes, but many proteins need chaperones to avoid inappropriate contacts in the crowded cytoplasm.',
    clickHint: 'Click any colored amino-acid sphere or peptide connector leaving the exit tunnel.',
  },
  {
    id: 'stop-codon',
    partKey: 'release-factor',
    title: 'Termination at Stop Codons',
    shortLabel: 'Stop & Release',
    category: 'Translation Termination',
    accent: '#f472b6',
    badge: 'UAA • UAG • UGA',
    summary:
      'A stop codon recruits a release factor rather than a tRNA, triggering release of the completed polypeptide without adding another amino acid.',
    details:
      'When UAA, UAG, or UGA enters the A site, a eukaryotic release factor recognizes the stop signal. The peptidyl-transferase center hydrolyzes the ester linkage joining the chain to the P-site tRNA. The polypeptide exits, tRNAs and mRNA disengage, and ribosomal subunits are recycled for another round of translation.',
    metrics: [
      { label: 'Stop Codons', value: 'UAA • UAG • UGA' },
      { label: 'A-Site Visitor', value: 'Release Factor, Not tRNA' },
      { label: 'Release Reaction', value: 'Peptidyl-tRNA Hydrolysis' },
      { label: 'Recycled Components', value: '40S • 60S • tRNA' },
    ],
    funFact:
      'The demonstration uses UAA after eight sense codons, so its released chain contains exactly eight amino acids—not nine.',
    clickHint: 'Click the pink release factor when it occupies the A site at the UAA codon.',
  },
];

export const DEMONSTRATION_CODONS = Object.freeze([
  { codon: 'AUG', aminoAcid: 'Met', name: 'Methionine', property: 'nonpolar', start: true },
  { codon: 'GCU', aminoAcid: 'Ala', name: 'Alanine', property: 'nonpolar' },
  { codon: 'UGG', aminoAcid: 'Trp', name: 'Tryptophan', property: 'aromatic' },
  { codon: 'UAC', aminoAcid: 'Tyr', name: 'Tyrosine', property: 'polar' },
  { codon: 'GGC', aminoAcid: 'Gly', name: 'Glycine', property: 'nonpolar' },
  { codon: 'UUC', aminoAcid: 'Phe', name: 'Phenylalanine', property: 'aromatic' },
  { codon: 'CCG', aminoAcid: 'Pro', name: 'Proline', property: 'nonpolar' },
  { codon: 'AAG', aminoAcid: 'Lys', name: 'Lysine', property: 'basic' },
  { codon: 'UAA', aminoAcid: 'Stop', name: 'Stop codon', property: 'stop', stop: true },
]);

export const DEMONSTRATION_SEQUENCE = DEMONSTRATION_CODONS.map((item) => item.codon).join('');

export const AMINO_ACID_COLORS = Object.freeze({
  nonpolar: '#fbbf24',
  aromatic: '#a78bfa',
  polar: '#22d3ee',
  basic: '#34d399',
  stop: '#f472b6',
});

export const RNA_BASE_COLORS = Object.freeze({
  A: '#22d3ee',
  U: '#fbbf24',
  G: '#34d399',
  C: '#a78bfa',
});

export const CENTRAL_DOGMA_PART_TO_TOPIC = Object.freeze(
  Object.fromEntries(CENTRAL_DOGMA_TOPICS.map((topic) => [topic.partKey, topic.id]))
);
