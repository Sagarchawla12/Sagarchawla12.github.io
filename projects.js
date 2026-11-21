const projects = [
  {
    id: "fuselage", category: "structures", course: "AER6611 · Polytechnique Montréal", format: "Team case study",
    title: "Pressurized fuselage structures", summary: "A finite-element comparison of circular and elliptical pressure shells.",
    tags: ["GFEM", "HyperMesh", "OptiStruct"],
    image: "fuselage-ellipse.webp", alt: "Finite-element displacement contour on a meshed elliptical fuselage segment",
    question: "How does changing a fuselage from circular to elliptical affect load distribution under cabin pressure?",
    method: "Our team built global finite-element models at three cross-section ratios (b/a = 1.00, 0.75 and 0.50). We tested skin and stringers, then added frames, then a floor. We checked the cylindrical reference against thin-shell theory and compared axial and hoop end loads in the central bays.",
    result: "The circular reference carried pressure with nearly uniform membrane loads. More elliptical sections showed stronger ovalisation and larger variations in end loads. Ring frames reduced this effect, and the floor helped redistribute load in the lower shell.",
    metrics: [["9", "Geometry and build-up combinations"], ["−1,644 → −665 lbf", "Peak axial compression at b/a = 0.50 when frames were added"]],
    detail: "The team ran nonlinear static analyses in OptiStruct and compared hoop end loads around Frame 4 and axial end loads in the central bays. In the b/a = 0.75 model, the floor beam changed the lower-shell load path while the ring frames supplied most of the resistance to ovalisation.",
    visual: "Choose a ratio to compare finite-element contour figures from the presentation.",
    figures: [
      { label: "b/a = 1.00", file: "fuselage-cylinder.webp", alt: "Displacement contour from the circular fuselage model" },
      { label: "b/a = 0.75", file: "fuselage-ellipse.webp", alt: "Displacement contour from the elliptical fuselage models" },
      { label: "b/a = 0.50", file: "fuselage-flat.webp", alt: "Displacement contour from the flatter elliptical fuselage models" }
    ]
  },
  {
    id: "lpu-training", category: "flight", course: "BTech Final Report · Lovely Professional University",
    title: "Prediction of Store Separation Trajectory and its Visualization",
    summary: "Undergraduate research at ADE–DRDO on computational modelling and comparison with experimental data.",
    image: "lpu-missile-surface-view.webp",
    href: "#lpu-report"
  },
  {
    id: "flight", category: "flight", course: "MECH 532 · McGill University", format: "Team project",
    title: "Boeing 747-400 flight performance", summary: "A phase-by-phase model of a long-haul flight, from runway to cruise and back.",
    tags: ["MATLAB", "Aircraft performance", "Stability"],
    alt: "Schematic altitude trace showing takeoff, climb, cruise, descent and landing",
    question: "How do mass, speed and altitude shape the performance of a Boeing 747-400 across a real route?",
    method: "Our team modeled takeoff, climb, cruise, descent and landing for a 747-400 with GE CF6 engines. The MATLAB workflow used standard atmosphere relations and updated aircraft mass as fuel was burned. We also examined runway friction and slope sensitivity and estimated longitudinal stability.",
    result: "The simulation exposed a mismatch between the assumed maximum takeoff mass and the modeled route. The calculated arrival mass exceeded the maximum landing weight, highlighting the importance of choosing an initial fuel load consistent with the mission.",
    metrics: [["6,514 km", "LH471 route distance used in the model"], ["35,000 ft", "Target cruise altitude"]],
    detail: "The climb calculation used separate speed schedules to 10,000 ft, 25,000 ft and cruise altitude. The cruise calculation marched forward in time and subtracted fuel burn from aircraft mass at each step. The runway sensitivity study varied surface friction and slope, and the stability analysis estimated the wing–tail downwash effect.",
    visual: "Play the schematic mission profile or select a phase to explore the analysis."
  },
  {
    id: "orbit", category: "flight", course: "MECH 542 · McGill University", format: "Individual project",
    title: "CubeSat orbital evolution", summary: "Tracking two spacecraft in near-circular low Earth orbits.",
    tags: ["Orbital mechanics", "Orbital elements", "J₂ perturbation"],
    alt: "Schematic of two inclined low Earth orbits",
    question: "How did the orbital elements of LASARSAT and CROCUBE change after launch?",
    method: "I reviewed time histories of orbital elements for LASARSAT (NORAD 62391) and CROCUBE (NORAD 62394), comparing inclination, eccentricity and the right ascension of the ascending node (RAAN).",
    result: "Both spacecraft followed similar near-circular orbits at roughly 45° inclination. The steady nodal drift and comparatively small inclination changes were consistent with the expected influence of Earth’s J₂ perturbation.",
    metrics: [["≈45°", "Orbital inclination"], ["2", "Spacecraft compared"]],
    detail: "Inclination measures the tilt of the orbital plane. RAAN locates where that plane crosses the equator northbound. Comparing those time histories showed that the planes changed orientation even as their tilt stayed nearly constant."
  },
  {
    id: "optics", category: "optics", course: "ECSE 527 Optical Engineering · McGill University", format: "Team project",
    title: "Automotive head-up display", summary: "Comparing optical layouts for a virtual image near the driver’s line of sight.",
    tags: ["CODE V", "Ray tracing", "Optical design"],
    alt: "Conceptual head-up display ray paths reflecting from optical elements",
    question: "How can a compact head-up display project an image at a long apparent distance while controlling aberrations across the field of view?",
    metrics: [["3.2 cycles/mm", "Estimated display Nyquist frequency"], ["−2%", "Combiner distortion at the 5° field edge"]],
    detail: "We tested on-axis, mid-field and edge-field positions at 486, 587 and 656 nm. The mirror-based design lost contrast around the estimated display resolution limit, while the combiner design resolved the display pixel across the tested field.",
    method: "We compared combiner and mirror-based optical layouts and assessed them in CODE V using spot diagrams, ray aberration, distortion and modulation transfer function (MTF). The project targeted an apparent image distance of at least 15–20 m.",
    result: "The final conventional combiner design produced smaller spot sizes than the display pixel across the tested fields. The report found approximately −2% distortion at the 5° field edge. The mirror-based layout showed more loss of image contrast at higher spatial frequencies."
  },
  {
    id: "carbon", category: "structures", course: "MECH 632 · McGill University", format: "Team literature study",
    title: "Carbon-fibre composites", summary: "A study of how carbon-fibre reinforcement affects stiffness, strength and fatigue.",
    tags: ["Composites", "Materials", "Fatigue"],
    image: "black-carbon-fibre.webp",
    alt: "Black carbon-fibre composite panel with a visible woven surface",
    visual: "Illustrative close-up of a woven carbon-fibre composite panel.",
    figures: [{ file: "black-carbon-fibre.webp", alt: "Close-up of the black weave and edge of a rigid carbon-fibre composite panel" }],
    question: "What makes carbon-fibre composites suitable for lightweight engineering structures?",
    detail: "The literature review considered tensile response and fatigue life together. Fibre orientation determines which load directions benefit most from the reinforcement, while the matrix and service conditions also affect how the composite performs over time.",
    method: "We reviewed carbon-fibre reinforcement across polymer and thermoplastic systems, considering tensile response, fatigue behaviour and how these properties influence applications in aerospace and other industries.",
    result: "The study connected the strength and stiffness benefits of lightweight reinforcement to design decisions about material system, fibre placement and the type of loading a part will see."
  },
  {
    id: "lca", category: "systems", course: "MECH 560 · McGill University", format: "Team project",
    title: "Turbomachinery lubrication life cycle", summary: "An environmental comparison of three lubrication layouts over a common service life.",
    tags: ["LCA", "Eco-design", "Monte Carlo"],
    alt: "Schematic cycle linking material, use and end-of-life stages",
    question: "How does the layout of a circulating lubrication system change its environmental impact?",
    method: "We compared three circulating lubrication systems across manufacturing, packaging, transportation, use and end of life. Each alternative provided the same lubrication service for 20 years.",
    result: "The decentralized system had the lowest modeled climate-change impact. The intermediate centralized system had a higher land-occupation impact than the traditional centralized system, showing that individual impact categories can rank the same alternatives differently.",
    metrics: [["20 years", "Functional unit"], ["3,000", "Monte Carlo iterations per system"]],
    detail: "Along with climate change, the assessment compared ecosystem quality, human health and resource impacts. We used mean simulation results for the comparison."
  },
  {
    id: "coffee", art: "lca", category: "systems", course: "MECH 560 · McGill University", format: "Team project",
    title: "Coffee maker eco-design", summary: "A product redesign based on materials, manufacturing, shipping and end of life.",
    tags: ["Sustainable Minds", "Eco-design", "Life cycle assessment"],
    image: "coffee-maker-concept.webp",
    alt: "Charcoal drip coffee maker with a glass carafe and metal trim",
    visual: "Illustrative render of a drip coffee maker concept.",
    figures: [{ file: "coffee-maker-concept.webp", alt: "Three-quarter view of a charcoal drip coffee maker concept with a glass carafe" }],
    question: "What combination of design changes would reduce the modeled environmental impact of a coffee maker?",
    method: "We modeled the reference product in Sustainable Minds, evaluated changes by life-cycle stage, and combined the selected changes into one redesign.",
    result: "The final design lowered modeled total impact and CO₂ emissions while also reducing product weight.",
    metrics: [["73.5%", "Lower modeled total environmental impact"], ["51%", "Lower modeled CO₂ emissions"], ["9%", "Lower product weight"]],
    detail: "The team explored recycled materials, revised manufacturing processes, a different shipping route and end-of-life improvements. The percentages compare the combined concept with the reference model under the report’s assumptions."
  }
];
