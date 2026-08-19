// Canonical Entity Registry & Entity Linking Engine for Government of India

// Canonical Registry for Ministries, Schemes, Institutions and Organizations
export const CANONICAL_REGISTRY = {
  // 1. MINISTRIES
  ministries: [
    {
      id: 'min-agri',
      canonicalName: 'Ministry of Agriculture and Farmers Welfare',
      canonicalHindi: 'कृषि एवं किसान कल्याण मंत्रालय',
      aliases: [
        'ministry of agriculture',
        'agriculture ministry',
        'moafw',
        'dept of agriculture',
        'कृषि मंत्रालय',
        'कृषि और किसान कल्याण मंत्रालय',
        'केंद्रीय कृषि मंत्रालय',
      ],
      portalUrl: 'https://agricoop.gov.in',
      domain: 'Agriculture & Rural Development',
    },
    {
      id: 'min-commerce',
      canonicalName: 'Ministry of Commerce and Industry',
      canonicalHindi: 'वाणिज्य एवं उद्योग मंत्रालय',
      aliases: [
        'ministry of commerce',
        'commerce ministry',
        'department of commerce',
        'moci',
        'वाणिज्य मंत्रालय',
        'उद्योग मंत्रालय',
        'वाणिज्य विभाग',
      ],
      portalUrl: 'https://commerce.gov.in',
      domain: 'Trade, Commerce & Industry',
    },
    {
      id: 'min-finance',
      canonicalName: 'Ministry of Finance',
      canonicalHindi: 'वित्त मंत्रालय',
      aliases: [
        'finance ministry',
        'mof',
        'finmin',
        'department of economic affairs',
        'वित्त मंत्रालय',
        'केंद्रीय वित्त मंत्रालय',
        'राजस्व विभाग',
      ],
      portalUrl: 'https://finmin.nic.in',
      domain: 'Economy, Finance & Taxation',
    },
    {
      id: 'min-health',
      canonicalName: 'Ministry of Health and Family Welfare',
      canonicalHindi: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय',
      aliases: [
        'health ministry',
        'mohfw',
        'department of health',
        'स्वास्थ्य मंत्रालय',
        'परिवार कल्याण मंत्रालय',
        'केंद्रीय स्वास्थ्य मंत्रालय',
      ],
      portalUrl: 'https://mohfw.gov.in',
      domain: 'Healthcare & Public Welfare',
    },
    {
      id: 'min-mnre',
      canonicalName: 'Ministry of New and Renewable Energy',
      canonicalHindi: 'नवीन एवं नवीकरणीय ऊर्जा मंत्रालय',
      aliases: [
        'mnre',
        'renewable energy ministry',
        'solar energy ministry',
        'नवीकरणीय ऊर्जा मंत्रालय',
        'अक्षय ऊर्जा मंत्रालय',
      ],
      portalUrl: 'https://mnre.gov.in',
      domain: 'Clean Energy & Environment',
    },
    {
      id: 'min-meity',
      canonicalName: 'Ministry of Electronics and Information Technology',
      canonicalHindi: 'इलेक्ट्रॉनिक्स और सूचना प्रौद्योगिकी मंत्रालय',
      aliases: [
        'meity',
        'it ministry',
        'electronics ministry',
        'सूचना प्रौद्योगिकी मंत्रालय',
        'आईटी मंत्रालय',
      ],
      portalUrl: 'https://meity.gov.in',
      domain: 'Digital India & Technology',
    },
    {
      id: 'min-defense',
      canonicalName: 'Ministry of Defence',
      canonicalHindi: 'रक्षा मंत्रालय',
      aliases: [
        'mod',
        'defence ministry',
        'रक्षा मंत्रालय',
        'केंद्रीय रक्षा मंत्रालय',
      ],
      portalUrl: 'https://mod.gov.in',
      domain: 'National Security & Defence',
    },
  ],

  // 2. FLAGSHIP CENTRAL SCHEMES
  schemes: [
    {
      id: 'scheme-pm-kisan',
      canonicalName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      canonicalHindi: 'प्रधानमंत्री किसान सम्मान निधि (पीएम-किसान)',
      aliases: [
        'pm-kisan',
        'pm kisan',
        'kisan samman nidhi',
        'pm kisan yojana',
        'पीएम किसान',
        'पीएम-किसान',
        'किसान सम्मान निधि',
      ],
      allocationStandard: '₹6,000 / year (Direct Benefit Transfer)',
      beneficiaryTarget: 'Small and Marginal Farmers',
    },
    {
      id: 'scheme-pm-kusum',
      canonicalName: 'Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM)',
      canonicalHindi: 'पीएम-कुसुम सौर ऊर्जा योजना',
      aliases: [
        'pm-kusum',
        'pm kusum',
        'kusum yojana',
        'solar pump scheme',
        'पीएम कुसुम',
        'पीएम-कुसुम',
        'सौर पंप योजना',
      ],
      allocationStandard: 'Up to 60-70% Solar Pump Subsidy',
      beneficiaryTarget: 'Farmers & Agri Feeders',
    },
    {
      id: 'scheme-ayushman',
      canonicalName: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
      canonicalHindi: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
      aliases: [
        'ayushman bharat',
        'pmjay',
        'pm-jay',
        'ayushman arogya mandir',
        'आयुष्मान भारत',
        'पीएम-जय',
        'जन आरोग्य योजना',
      ],
      allocationStandard: '₹5,00,000 Health Cover / Family',
      beneficiaryTarget: 'Vulnerable Families & Senior Citizens',
    },
    {
      id: 'scheme-digital-india',
      canonicalName: 'Digital India & Digital Public Infrastructure (DPI)',
      canonicalHindi: 'डिजिटल इंडिया एवं डिजिटल सार्वजनिक अवसंरचना',
      aliases: [
        'digital india',
        'dpi',
        'upi',
        'e-sanjeevani',
        'डिजिटल इंडिया',
        'डिजिटल भारत',
      ],
      allocationStandard: 'Nationwide Connectivity & Digital Services',
      beneficiaryTarget: 'Citizens, Startups & Rural Centers',
    },
  ],

  // 3. APEX INSTITUTIONS & BODIES
  institutions: [
    {
      id: 'inst-icar',
      canonicalName: 'Indian Council of Agricultural Research (ICAR)',
      canonicalHindi: 'भारतीय कृषि अनुसंधान परिषद (आईसीएआर)',
      aliases: ['icar', 'भारतीय कृषि अनुसंधान परिषद', 'पूसा संस्थान'],
    },
    {
      id: 'inst-isro',
      canonicalName: 'Indian Space Research Organisation (ISRO)',
      canonicalHindi: 'भारतीय अंतरिक्ष अनुसंधान संगठन (इसरो)',
      aliases: ['isro', 'इसरो', 'अंतरिक्ष विभाग'],
    },
    {
      id: 'inst-drdo',
      canonicalName: 'Defence Research and Development Organisation (DRDO)',
      canonicalHindi: 'रक्षा अनुसंधान एवं विकास संगठन (डीआरडीओ)',
      aliases: ['drdo', 'डीआरडीओ'],
    },
    {
      id: 'inst-rbi',
      canonicalName: 'Reserve Bank of India (RBI)',
      canonicalHindi: 'भारतीय रिजर्व बैंक (आरबीआई)',
      aliases: ['rbi', 'reserve bank', 'भारतीय रिजर्व बैंक', 'आरबीआई'],
    },
    {
      id: 'inst-pib',
      canonicalName: 'Press Information Bureau, Government of India',
      canonicalHindi: 'प्रेस सूचना ब्यूरो, भारत सरकार',
      aliases: ['pib', 'press information bureau', 'प्रेस सूचना ब्यूरो', 'पीआईबी'],
    },
  ],
};

// Resolve any raw mention to its canonical government entity
export function linkEntities(text = '') {
  const normalized = text.toLowerCase();
  const matchedEntities = [];
  const seenIds = new Set();

  // 1. Resolve Ministries
  for (const min of CANONICAL_REGISTRY.ministries) {
    if (min.aliases.some((alias) => normalized.includes(alias.toLowerCase()))) {
      if (!seenIds.has(min.id)) {
        seenIds.add(min.id);
        matchedEntities.push({
          type: 'MINISTRY',
          canonicalId: min.id,
          name: min.canonicalName,
          nameHindi: min.canonicalHindi,
          portalUrl: min.portalUrl,
          domain: min.domain,
          verified: true,
        });
      }
    }
  }

  // 2. Resolve Schemes
  for (const scheme of CANONICAL_REGISTRY.schemes) {
    if (scheme.aliases.some((alias) => normalized.includes(alias.toLowerCase()))) {
      if (!seenIds.has(scheme.id)) {
        seenIds.add(scheme.id);
        matchedEntities.push({
          type: 'SCHEME',
          canonicalId: scheme.id,
          name: scheme.canonicalName,
          nameHindi: scheme.canonicalHindi,
          allocationStandard: scheme.allocationStandard,
          beneficiaryTarget: scheme.beneficiaryTarget,
          verified: true,
        });
      }
    }
  }

  // 3. Resolve Institutions
  for (const inst of CANONICAL_REGISTRY.institutions) {
    if (inst.aliases.some((alias) => normalized.includes(alias.toLowerCase()))) {
      if (!seenIds.has(inst.id)) {
        seenIds.add(inst.id);
        matchedEntities.push({
          type: 'INSTITUTION',
          canonicalId: inst.id,
          name: inst.canonicalName,
          nameHindi: inst.canonicalHindi,
          verified: true,
        });
      }
    }
  }

  return matchedEntities;
}
