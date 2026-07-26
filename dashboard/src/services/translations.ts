// Localization translations for PhishShield AI Dashboard
// Supports: English ('en'), Telugu ('te'), Hindi ('hi')

export type LanguageCode = 'en' | 'te' | 'hi';

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Sidebar
    'nav.dashboard': 'Dashboard',
    'nav.analysis': 'Website Analysis',
    'nav.history': 'Scan History',
    'nav.userReports': 'User Reports',
    'nav.intelligence': 'Threat Intelligence',
    'nav.emailAnalyzer': 'Email Analyzer',
    'nav.reports': 'Reports',
    'nav.statistics': 'Statistics',
    'nav.settings': 'Settings',
    'sidebar.systemActive': 'System Active',
    'sidebar.systemActiveSub': 'Real-time protection enabled. AI models are up to date.',

    // Headers & Overviews
    'header.overview': 'Overview',
    'header.overviewSub': 'Real-time threat analytics and system status.',
    'header.reports': 'Security Reports',
    'header.reportsSub': 'Generate, download, and share comprehensive security analysis reports.',
    'header.settings': 'System Settings',
    'header.settingsSub': 'Configure dashboard preferences and detection parameters.',
    'header.searchPlaceholder': 'Search URLs, domains, or IP addresses...',
    'role.admin': 'Security Administrator',
    'role.analyst': 'Security Analyst',
    'role.user': 'User',

    // Settings Panel
    'settings.appearance': 'Appearance & Behavior',
    'settings.darkMode': 'Dark Mode',
    'settings.lightMode': 'Light Mode',
    'settings.darkModeSub': 'Dark cyberpunk theme active',
    'settings.lightModeSub': 'Light theme active',
    'settings.notifications': 'System Notifications',
    'settings.notificationsSub': 'Alerts for high-risk threats enabled',
    'settings.notificationsDisabled': 'Notifications disabled',
    'settings.language': 'Language',
    'settings.languageSub': 'Dashboard interface language',
    'settings.security': 'Security & Detection',
    'settings.realTime': 'Real-Time Protection',
    'settings.realTimeSub': 'Actively monitoring and blocking threats',
    'settings.realTimeDisabled': 'Real-time protection disabled',
    'settings.autoScan': 'Auto-Scan Links',
    'settings.autoScanSub': 'Links are automatically analyzed',
    'settings.autoScanDisabled': 'Manual scanning only',
    'settings.save': 'Save Settings',
    'settings.saving': 'Saving...',
    'settings.saved': 'Settings Saved!',
  },
  te: {
    // Sidebar
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.analysis': 'వెబ్‌సైట్ విశ్లేషణ',
    'nav.history': 'స్కాన్ చరిత్ర',
    'nav.userReports': 'వినియోగదారు నివేదికలు',
    'nav.intelligence': 'ముప్పు సమాచారం',
    'nav.emailAnalyzer': 'ఇమెయిల్ విశ్లేషణ',
    'nav.reports': 'నివేదికలు',
    'nav.statistics': 'గణాంకాలు',
    'nav.settings': 'సెట్టింగులు',
    'sidebar.systemActive': 'సిస్టమ్ సక్రియంగా ఉంది',
    'sidebar.systemActiveSub': 'నిజ-సమయ రక్షణ ప్రారంభించబడింది. AI నమూనాలు తాజాగా ఉన్నాయి.',

    // Headers & Overviews
    'header.overview': 'అవలోకనం',
    'header.overviewSub': 'నిజ-సమయ ముప్పు విశ్లేషణ మరియు సిస్టమ్ స్థితి.',
    'header.reports': 'భద్రతా నివేదికలు',
    'header.reportsSub': 'సమగ్ర భద్రతా విశ్లేషణ నివేదికలను సృష్టించండి, డౌన్‌లోడ్ చేయండి మరియు భాగస్వామ్యం చేయండి.',
    'header.settings': 'సిస్టమ్ సెట్టింగులు',
    'header.settingsSub': 'డాష్‌బోర్డ్ ప్రాధాన్యతలు మరియు గుర్తింపు పారామితులను కాన్ఫిగర్ చేయండి.',
    'header.searchPlaceholder': 'URLలు, డొమైన్‌లు లేదా IP చిరునామాలను శోధించండి...',
    'role.admin': 'భద్రతా నిర్వాహకుడు',
    'role.analyst': 'భద్రతా విశ్లేషకుడు',

    // Settings Panel
    'settings.appearance': 'ప్రదర్శన & ప్రవర్తన',
    'settings.darkMode': 'డార్క్ మోడ్',
    'settings.lightMode': 'లైట్ మోడ్',
    'settings.darkModeSub': 'డార్క్ సైబర్‌పంక్ థీమ్ సక్రియంగా ఉంది',
    'settings.lightModeSub': 'లైట్ థీమ్ సక్రియంగా ఉంది',
    'settings.notifications': 'సిస్టమ్ నోటిఫికేషన్లు',
    'settings.notificationsSub': 'అధిక-ప్రమాద ముప్పుల కోసం హెచ్చరికలు ప్రారంభించబడ్డాయి',
    'settings.notificationsDisabled': 'నోటిఫికేషన్లు నిలిపివేయబడ్డాయి',
    'settings.language': 'భాష',
    'settings.languageSub': 'డాష్‌బోర్డ్ ఇంటర్‌ఫేస్ భాష',
    'settings.security': 'భద్రత & గుర్తింపు',
    'settings.realTime': 'నిజ-సమయ రక్షణ',
    'settings.realTimeSub': 'ముప్పులను చురుకుగా పర్యవేక్షించడం మరియు నిరోధించడం',
    'settings.realTimeDisabled': 'నిజ-సమయ రక్షణ నిలిపివేయబడింది',
    'settings.autoScan': 'లింక్‌లను ఆటో-స్కాన్ చేయి',
    'settings.autoScanSub': 'లింక్‌లు స్వయంచాలకంగా విశ్లేషించబడతాయి',
    'settings.autoScanDisabled': 'మాన్యువల్ స్కానింగ్ మాత్రమే',
    'settings.save': 'సెట్టింగులను సేవ్ చేయి',
    'settings.saving': 'సేవ్ అవుతోంది...',
    'settings.saved': 'సెట్టింగులు సేవ్ చేయబడ్డాయి!',
  },
  hi: {
    // Sidebar
    'nav.dashboard': 'डैशबोर्ड',
    'nav.analysis': 'वेबसाइट विश्लेषण',
    'nav.history': 'स्कैन इतिहास',
    'nav.userReports': 'उपयोगकर्ता रिपोर्ट',
    'nav.intelligence': 'खतरा खुफिया',
    'nav.emailAnalyzer': 'ईमेल विश्लेषक',
    'nav.reports': 'रिपोर्ट',
    'nav.statistics': 'आंकड़े',
    'nav.settings': 'सेटिंग्स',
    'sidebar.systemActive': 'सिस्टम सक्रिय',
    'sidebar.systemActiveSub': 'वास्तविक समय सुरक्षा सक्षम। AI मॉडल अद्यतित हैं।',

    // Headers & Overviews
    'header.overview': 'अवलोकन',
    'header.overviewSub': 'वास्तविक समय खतरा विश्लेषण और सिस्टम स्थिति।',
    'header.reports': 'सुरक्षा रिपोर्ट',
    'header.reportsSub': 'व्यापक सुरक्षा विश्लेषण रिपोर्ट उत्पन्न करें, डाउनलोड करें और साझा करें।',
    'header.settings': 'सिस्टम सेटिंग्स',
    'header.settingsSub': 'डैशबोर्ड प्राथमिकताओं और पहचान मापदंडों को कॉन्फ़िगर करें।',
    'header.searchPlaceholder': 'यूआरएल, डोमेन या आईपी पते खोजें...',
    'role.admin': 'सुरक्षा प्रशासक',
    'role.analyst': 'सुरक्षा विश्लेषक',

    // Settings Panel
    'settings.appearance': 'सूरत और व्यवहार',
    'settings.darkMode': 'डार्क मोड',
    'settings.lightMode': 'लाइट मोड',
    'settings.darkModeSub': 'डार्क साइबरपंक थीम सक्रिय है',
    'settings.lightModeSub': 'लाइट थीम सक्रिय है',
    'settings.notifications': 'सिस्टम सूचनाएं',
    'settings.notificationsSub': 'उच्च जोखिम वाले खतरों के लिए अलर्ट सक्षम',
    'settings.notificationsDisabled': 'सूचनाएं अक्षम',
    'settings.language': 'भाषा',
    'settings.languageSub': 'डैशबोर्ड इंटरफ़ेस भाषा',
    'settings.security': 'सुरक्षा और पहचान',
    'settings.realTime': 'वास्तविक समय सुरक्षा',
    'settings.realTimeSub': 'सक्रिय रूप से खतरों की निगरानी और अवरोधन',
    'settings.realTimeDisabled': 'वास्तविक समय सुरक्षा अक्षम',
    'settings.autoScan': 'ऑटो-स्कैन लिंक',
    'settings.autoScanSub': 'लिंक्स का स्वचालित रूप से विश्लेषण किया जाता है',
    'settings.autoScanDisabled': 'केवल मैन्युअल स्कैनिंग',
    'settings.save': 'सेटिंग्स सुरक्षित करें',
    'settings.saving': 'सुरक्षित हो रहा है...',
    'settings.saved': 'सेटिंग्स सुरक्षित की गईं!',
  }
};

export function translate(key: string, lang: string = 'en'): string {
  const code = (['en', 'te', 'hi'].includes(lang) ? lang : 'en') as LanguageCode;
  return translations[code][key] || translations['en'][key] || key;
}
