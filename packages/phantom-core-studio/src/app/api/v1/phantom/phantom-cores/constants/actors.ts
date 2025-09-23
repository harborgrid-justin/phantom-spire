// Threat Actors Constants
// Comprehensive threat actor groups, types, and characteristics

export const ACTOR_TYPES = {
  NATION_STATE: 'nation_state',
  APT_GROUP: 'apt_group',
  CYBERCRIMINAL: 'cybercriminal',
  HACKTIVIST: 'hacktivist',
  INSIDER: 'insider',
  SCRIPT_KIDDIE: 'script_kiddie',
  TERRORIST: 'terrorist',
  STATE_SPONSORED: 'state_sponsored',
  ORGANIZED_CRIME: 'organized_crime',
  INDIVIDUAL: 'individual',
  UNKNOWN: 'unknown'
} as const;

export const APT_GROUPS = [
  'APT1', 'APT2', 'APT3', 'APT4', 'APT5', 'APT6', 'APT7', 'APT8', 'APT9', 'APT10',
  'APT11', 'APT12', 'APT13', 'APT14', 'APT15', 'APT16', 'APT17', 'APT18', 'APT19', 'APT20',
  'APT21', 'APT22', 'APT23', 'APT24', 'APT25', 'APT26', 'APT27', 'APT28', 'APT29', 'APT30',
  'APT31', 'APT32', 'APT33', 'APT34', 'APT35', 'APT36', 'APT37', 'APT38', 'APT39', 'APT40',
  'APT41', 'APT42', 'APT43', 'APT44', 'APT45', 'APT46', 'APT47', 'APT48', 'APT49', 'APT50',
  'Lazarus Group', 'Equation Group', 'Carbanak', 'Turla', 'Sandworm', 'Fancy Bear', 
  'Cozy Bear', 'Dragonfly', 'Comment Crew', 'PLA Unit 61398', 'Leviathan', 'Muddy Water',
  'OilRig', 'Charming Kitten', 'Reaper', 'Kimsuky', 'Andariel', 'BlueNoroff', 'Winnti',
  'Deep Panda', 'Stone Panda', 'Threat Group-3390', 'Bronze Butler', 'Dark Caracal',
  'Elderwood', 'Emissary Panda', 'FIN10', 'Group5', 'Honeybee', 'Iron', 'PLATINUM',
  'Putter Panda', 'Samurai Panda', 'Sofacy', 'The Dukes', 'Tropic Trooper', 'admin@338',
  'menuPass', 'Tick', 'BlackTech', 'Naikon', 'Patchwork', 'Sidewinder', 'SilverTerrier'
] as const;

export const CYBERCRIMINAL_GROUPS = [
  'FIN1', 'FIN2', 'FIN3', 'FIN4', 'FIN5', 'FIN6', 'FIN7', 'FIN8', 'FIN9', 'FIN10',
  'FIN11', 'FIN12', 'FIN13', 'Evil Corp', 'Conti', 'REvil', 'LockBit', 'BlackCat',
  'DarkSide', 'Maze', 'Ryuk', 'Sodinokibi', 'NetWalker', 'Egregor', 'DoppelPaymer',
  'Ragnar Locker', 'Clop', 'Avaddon', 'Dharma', 'Phobos', 'STOP', 'GandCrab',
  'WannaCry', 'NotPetya', 'BadRabbit', 'SamSam', 'LockerGoga', 'MegaCortex',
  'Nemty', 'Snatch', 'PYSA', 'Babuk', 'DarkHalo', 'BlackKingdom', 'Cuba',
  'Grief', 'Hive', 'LV', 'Mount Locker', 'Prometheus', 'Thanos', 'Vice Society',
  'BlackByte', 'Karakurt', 'Lapsus$', 'TA505', 'TA506', 'TA544', 'Cobalt Group',
  'Silence', 'MoneyTaker', 'Buhtrap', 'Anunak', 'Metel', 'GCMAN', 'Corkow'
] as const;

export const HACKTIVIST_GROUPS = [
  'Anonymous', 'LulzSec', 'Syrian Electronic Army', 'Cyber Caliphate', 'Ghost Squad Hackers',
  'New World Hackers', 'OurMine', 'Lizard Squad', 'PhineasFisher', 'RedHack',
  'TeaMp0isoN', 'AntiSec', 'Chaos Computer Club', 'Cult of the Dead Cow',
  'Level Seven', 'Global Hell', 'Masters of Deception', '2600', 'Legion of Doom',
  'Chaos Communication Congress', 'Tarh Andishan', 'Iran Cyber Army', 'Izz ad-Din al-Qassam',
  'Cutting Sword of Justice', 'Yemen Cyber Army', 'Fallaga Team', 'AnonGhost',
  'Indonesian Security Down', 'PakBugs', 'IndiShell', 'Team GhostShell'
] as const;

export const NATION_STATE_ACTORS = [
  'Chinese PLA', 'Russian GRU', 'Russian SVR', 'Iranian Revolutionary Guard',
  'North Korean RGB', 'Israeli Unit 8200', 'US NSA TAO', 'UK GCHQ',
  'French DGSE', 'German BND', 'Australian ASD', 'Canadian CSE',
  'Dutch AIVD', 'South Korean NIS', 'Japanese NISC', 'Indian RAW',
  'Pakistani ISI', 'Turkish MIT', 'Saudi MABAHITH', 'UAE National Electronic Security Authority'
] as const;

export const INSIDER_THREAT_TYPES = {
  MALICIOUS_INSIDER: 'malicious_insider',
  NEGLIGENT_INSIDER: 'negligent_insider',
  COMPROMISED_INSIDER: 'compromised_insider',
  THIRD_PARTY_INSIDER: 'third_party_insider'
} as const;

export const SOPHISTICATION_LEVELS = {
  NOVICE: 'novice',
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
  NATION_STATE: 'nation_state'
} as const;

export const ACTOR_ORIGINS = [
  'China', 'Russia', 'North Korea', 'Iran', 'United States', 'Israel',
  'United Kingdom', 'Germany', 'France', 'Netherlands', 'Australia',
  'Canada', 'Japan', 'South Korea', 'India', 'Pakistan', 'Turkey',
  'Saudi Arabia', 'UAE', 'Brazil', 'Ukraine', 'Belarus', 'Syria',
  'Venezuela', 'Vietnam', 'Romania', 'Bulgaria', 'Czech Republic',
  'Poland', 'Hungary', 'Slovakia', 'Lithuania', 'Latvia', 'Estonia',
  'Unknown', 'Multiple Countries', 'Stateless'
] as const;

export const ACTOR_MOTIVATIONS = {
  FINANCIAL_GAIN: 'financial_gain',
  ESPIONAGE: 'espionage',
  SABOTAGE: 'sabotage',
  IDEOLOGICAL: 'ideological',
  REVENGE: 'revenge',
  NOTORIETY: 'notoriety',
  CURIOSITY: 'curiosity',
  DOMINANCE: 'dominance',
  POLITICAL: 'political',
  RELIGIOUS: 'religious',
  NATIONALIST: 'nationalist',
  COMPETITIVE_ADVANTAGE: 'competitive_advantage',
  INTELLECTUAL_PROPERTY_THEFT: 'intellectual_property_theft',
  MILITARY_ADVANTAGE: 'military_advantage',
  ECONOMIC_WARFARE: 'economic_warfare'
} as const;

export const ACTOR_CAPABILITIES = {
  BASIC_SCRIPTING: 'basic_scripting',
  INTERMEDIATE_PROGRAMMING: 'intermediate_programming',
  ADVANCED_MALWARE_DEVELOPMENT: 'advanced_malware_development',
  ZERO_DAY_DEVELOPMENT: 'zero_day_development',
  CUSTOM_TOOL_DEVELOPMENT: 'custom_tool_development',
  INFRASTRUCTURE_MANAGEMENT: 'infrastructure_management',
  SOCIAL_ENGINEERING: 'social_engineering',
  PHYSICAL_ACCESS: 'physical_access',
  INSIDER_RECRUITMENT: 'insider_recruitment',
  SUPPLY_CHAIN_COMPROMISE: 'supply_chain_compromise',
  LIVING_OFF_THE_LAND: 'living_off_the_land',
  ANTI_FORENSICS: 'anti_forensics'
} as const;

export const TARGETING_STRATEGIES = {
  OPPORTUNISTIC: 'opportunistic',
  TARGETED: 'targeted',
  MASS_SCALE: 'mass_scale',
  SECTOR_SPECIFIC: 'sector_specific',
  GEOGRAPHY_SPECIFIC: 'geography_specific',
  SUPPLY_CHAIN_FOCUSED: 'supply_chain_focused',
  HIGH_VALUE_TARGETS: 'high_value_targets',
  VULNERABILITY_BASED: 'vulnerability_based'
} as const;

export const OPERATIONAL_PATTERNS = {
  STEALTH_FOCUSED: 'stealth_focused',
  SPEED_FOCUSED: 'speed_focused',
  PERSISTENT: 'persistent',
  HIT_AND_RUN: 'hit_and_run',
  MULTI_STAGE: 'multi_stage',
  BLENDED_ATTACK: 'blended_attack',
  COORDINATED: 'coordinated',
  AUTONOMOUS: 'autonomous'
} as const;

export const RESOURCE_LEVELS = {
  MINIMAL: 'minimal',
  LIMITED: 'limited',
  MODERATE: 'moderate',
  SUBSTANTIAL: 'substantial',
  EXTENSIVE: 'extensive',
  NATION_STATE: 'nation_state'
} as const;

export const COMMUNICATION_METHODS = {
  DARK_WEB_FORUMS: 'dark_web_forums',
  ENCRYPTED_MESSAGING: 'encrypted_messaging',
  SOCIAL_MEDIA: 'social_media',
  IRC_CHANNELS: 'irc_channels',
  PEER_TO_PEER: 'peer_to_peer',
  DEAD_DROPS: 'dead_drops',
  STEGANOGRAPHY: 'steganography',
  BLOCKCHAIN: 'blockchain'
} as const;

export const MONETIZATION_METHODS = {
  RANSOM_PAYMENTS: 'ransom_payments',
  CRYPTOCURRENCY_THEFT: 'cryptocurrency_theft',
  BANKING_FRAUD: 'banking_fraud',
  CREDIT_CARD_FRAUD: 'credit_card_fraud',
  IDENTITY_THEFT: 'identity_theft',
  DATA_SELLING: 'data_selling',
  EXTORTION: 'extortion',
  AFFILIATE_PROGRAMS: 'affiliate_programs',
  RANSOMWARE_AS_A_SERVICE: 'ransomware_as_a_service',
  ACCESS_SELLING: 'access_selling'
} as const;

export const ATTRIBUTION_CONFIDENCE = {
  DEFINITIVE: 'definitive',
  HIGH: 'high',
  MODERATE: 'moderate',
  LOW: 'low',
  SPECULATIVE: 'speculative'
} as const;

export const ATTRIBUTION_FACTORS = [
  'Infrastructure Overlap',
  'TTP Similarity',
  'Code Reuse',
  'Operational Patterns',
  'Targeting Overlap',
  'Timing Correlation',
  'Linguistic Analysis',
  'Geopolitical Context',
  'Technical Fingerprints',
  'Human Intelligence',
  'Open Source Intelligence',
  'Metadata Analysis',
  'Behavioral Patterns',
  'Tool Usage',
  'Certificate Reuse',
  'Domain Registration Patterns',
  'Malware Families',
  'Command and Control Infrastructure',
  'Payment Methods',
  'Communication Patterns'
] as const;

export const ACTOR_STATUS = {
  ACTIVE: 'active',
  DORMANT: 'dormant',
  DISBANDED: 'disbanded',
  MERGED: 'merged',
  SPLINTER: 'splinter',
  UNKNOWN: 'unknown'
} as const;

export const OPERATIONAL_SECURITY_LEVELS = {
  POOR: 'poor',
  BASIC: 'basic',
  GOOD: 'good',
  ADVANCED: 'advanced',
  EXCEPTIONAL: 'exceptional'
} as const;

export const COLLABORATION_TYPES = {
  INDEPENDENT: 'independent',
  LOOSE_AFFILIATION: 'loose_affiliation',
  FORMAL_PARTNERSHIP: 'formal_partnership',
  HIERARCHICAL: 'hierarchical',
  NETWORK: 'network',
  HYBRID: 'hybrid'
} as const;

// Actor group aliases and alternative names
export const ACTOR_ALIASES = {
  APT1: ['Comment Crew', 'PLA Unit 61398', 'Shanghai Group'],
  APT28: ['Fancy Bear', 'Sofacy', 'Pawn Storm', 'Sednit', 'TsarTeam'],
  APT29: ['Cozy Bear', 'The Dukes', 'CozyDuke', 'Nobelium', 'UNC2452'],
  APT32: ['OceanLotus', 'Cobalt Kitty', 'SeaLotus'],
  APT33: ['Elfin', 'Magnallium', 'Refined Kitten'],
  APT34: ['OilRig', 'Twisted Kitten', 'Helix Kitten'],
  APT35: ['Charming Kitten', 'Phosphorus', 'Newscaster'],
  APT37: ['Reaper', 'Group123', 'Red Eyes'],
  APT38: ['Lazarus Group', 'Hidden Cobra', 'Guardians of Peace'],
  APT40: ['Leviathan', 'Muddy Water', 'Periscope', 'Bronze Mohawk'],
  APT41: ['Barium', 'Winnti', 'Wicked Panda', 'Double Dragon']
} as const;

// Type definitions
export type ActorType = typeof ACTOR_TYPES[keyof typeof ACTOR_TYPES];
export type InsiderThreatType = typeof INSIDER_THREAT_TYPES[keyof typeof INSIDER_THREAT_TYPES];
export type SophisticationLevel = typeof SOPHISTICATION_LEVELS[keyof typeof SOPHISTICATION_LEVELS];
export type ActorMotivation = typeof ACTOR_MOTIVATIONS[keyof typeof ACTOR_MOTIVATIONS];
export type ActorCapability = typeof ACTOR_CAPABILITIES[keyof typeof ACTOR_CAPABILITIES];
export type TargetingStrategy = typeof TARGETING_STRATEGIES[keyof typeof TARGETING_STRATEGIES];
export type OperationalPattern = typeof OPERATIONAL_PATTERNS[keyof typeof OPERATIONAL_PATTERNS];
export type ResourceLevel = typeof RESOURCE_LEVELS[keyof typeof RESOURCE_LEVELS];
export type CommunicationMethod = typeof COMMUNICATION_METHODS[keyof typeof COMMUNICATION_METHODS];
export type MonetizationMethod = typeof MONETIZATION_METHODS[keyof typeof MONETIZATION_METHODS];
export type AttributionConfidence = typeof ATTRIBUTION_CONFIDENCE[keyof typeof ATTRIBUTION_CONFIDENCE];
export type ActorStatus = typeof ACTOR_STATUS[keyof typeof ACTOR_STATUS];
export type OperationalSecurityLevel = typeof OPERATIONAL_SECURITY_LEVELS[keyof typeof OPERATIONAL_SECURITY_LEVELS];
export type CollaborationType = typeof COLLABORATION_TYPES[keyof typeof COLLABORATION_TYPES];
