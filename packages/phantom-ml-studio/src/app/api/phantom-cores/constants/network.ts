// Network and Infrastructure Constants
// Comprehensive networking, infrastructure, and communication constants

export const NETWORK_PROTOCOLS = {
  HTTP: 'http',
  HTTPS: 'https',
  FTP: 'ftp',
  FTPS: 'ftps',
  SFTP: 'sftp',
  SMTP: 'smtp',
  SMTPS: 'smtps',
  POP3: 'pop3',
  POP3S: 'pop3s',
  IMAP: 'imap',
  IMAPS: 'imaps',
  DNS: 'dns',
  DHCP: 'dhcp',
  TCP: 'tcp',
  UDP: 'udp',
  ICMP: 'icmp',
  SSH: 'ssh',
  TELNET: 'telnet',
  SNMP: 'snmp',
  NTP: 'ntp',
  LDAP: 'ldap',
  LDAPS: 'ldaps',
  SMB: 'smb',
  CIFS: 'cifs',
  NFS: 'nfs',
  RDP: 'rdp',
  VNC: 'vnc',
  XMPP: 'xmpp',
  SIP: 'sip',
  RTP: 'rtp',
  RTCP: 'rtcp',
  MQTT: 'mqtt',
  COAP: 'coap',
  WEBSOCKET: 'websocket'
} as const;

export const PORT_CATEGORIES = {
  WELL_KNOWN: 'well_known',    // 0-1023
  REGISTERED: 'registered',    // 1024-49151
  DYNAMIC: 'dynamic',          // 49152-65535
  SUSPICIOUS: 'suspicious',
  EPHEMERAL: 'ephemeral'
} as const;

export const COMMON_PORTS = {
  FTP: 21,
  SSH: 22,
  TELNET: 23,
  SMTP: 25,
  DNS: 53,
  DHCP_SERVER: 67,
  DHCP_CLIENT: 68,
  TFTP: 69,
  HTTP: 80,
  POP3: 110,
  NNTP: 119,
  NTP: 123,
  IMAP: 143,
  SNMP: 161,
  SNMP_TRAP: 162,
  LDAP: 389,
  HTTPS: 443,
  SMB: 445,
  SMTP_SUBMISSION: 587,
  LDAPS: 636,
  IMAPS: 993,
  POP3S: 995,
  MSSQL: 1433,
  ORACLE: 1521,
  MYSQL: 3306,
  RDP: 3389,
  SIP: 5060,
  SIPS: 5061,
  POSTGRESQL: 5432,
  VNC: 5900,
  REDIS: 6379,
  HTTP_ALT: 8080,
  HTTPS_ALT: 8443
} as const;

export const SUSPICIOUS_PORTS = [
  1337, 1338, 1339, // Leet speak ports
  31337, 31338, 31339, // Elite hacker ports
  12345, 23456, 54321, // Common backdoor ports
  6666, 6667, 6668, // IRC and malware ports
  1234, 4321, 9999, // Generic backdoor ports
  8888, 7777, 9876, // Alternative web/backdoor ports
  40421, 40422, 40423, // Master's Paradise trojan
  12076, 61466, // Telecommando trojan
  21544, // GirlFriend trojan
  30100, // NetSphere trojan
  50766, // Fore trojan
  65000 // Devil trojan
] as const;

export const NETWORK_TYPES = {
  LAN: 'lan',
  WAN: 'wan',
  WLAN: 'wlan',
  MAN: 'man',
  PAN: 'pan',
  VPN: 'vpn',
  VLAN: 'vlan',
  INTERNET: 'internet',
  INTRANET: 'intranet',
  EXTRANET: 'extranet',
  DMZ: 'dmz'
} as const;

export const IP_VERSIONS = {
  IPV4: 'ipv4',
  IPV6: 'ipv6'
} as const;

export const PRIVATE_IP_RANGES = {
  CLASS_A: '10.0.0.0/8',
  CLASS_B: '172.16.0.0/12',
  CLASS_C: '192.168.0.0/16',
  LOCALHOST: '127.0.0.0/8',
  LINK_LOCAL: '169.254.0.0/16',
  MULTICAST: '224.0.0.0/4',
  CLASS_E: '240.0.0.0/4'
} as const;

export const DNS_RECORD_TYPES = {
  A: 'a',
  AAAA: 'aaaa',
  CNAME: 'cname',
  MX: 'mx',
  NS: 'ns',
  PTR: 'ptr',
  SOA: 'soa',
  SRV: 'srv',
  TXT: 'txt',
  SPF: 'spf',
  DKIM: 'dkim',
  DMARC: 'dmarc',
  CAA: 'caa'
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  TRACE: 'TRACE',
  CONNECT: 'CONNECT'
} as const;

export const HTTP_STATUS_CODES = {
  // Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  
  // Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  
  // Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTH_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL: 451,
  
  // Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTH_REQUIRED: 511
} as const;

export const NETWORK_DEVICES = {
  ROUTER: 'router',
  SWITCH: 'switch',
  HUB: 'hub',
  BRIDGE: 'bridge',
  GATEWAY: 'gateway',
  FIREWALL: 'firewall',
  PROXY: 'proxy',
  LOAD_BALANCER: 'load_balancer',
  ACCESS_POINT: 'access_point',
  MODEM: 'modem',
  REPEATER: 'repeater',
  NIC: 'nic',
  WAF: 'waf',
  IDS: 'ids',
  IPS: 'ips'
} as const;

export const WIRELESS_STANDARDS = {
  IEEE_802_11A: '802.11a',
  IEEE_802_11B: '802.11b',
  IEEE_802_11G: '802.11g',
  IEEE_802_11N: '802.11n',
  IEEE_802_11AC: '802.11ac',
  IEEE_802_11AX: '802.11ax',
  BLUETOOTH: 'bluetooth',
  ZIGBEE: 'zigbee',
  ZWAVE: 'zwave',
  NFC: 'nfc',
  LORA: 'lora',
  SIGFOX: 'sigfox'
} as const;

export const ENCRYPTION_PROTOCOLS = {
  WEP: 'wep',
  WPA: 'wpa',
  WPA2: 'wpa2',
  WPA3: 'wpa3',
  TLS_1_0: 'tls_1_0',
  TLS_1_1: 'tls_1_1',
  TLS_1_2: 'tls_1_2',
  TLS_1_3: 'tls_1_3',
  SSL_3_0: 'ssl_3_0',
  IPSEC: 'ipsec',
  PPTP: 'pptp',
  L2TP: 'l2tp',
  OPENVPN: 'openvpn',
  WIREGUARD: 'wireguard'
} as const;

export const NETWORK_TOPOLOGIES = {
  STAR: 'star',
  BUS: 'bus',
  RING: 'ring',
  MESH: 'mesh',
  TREE: 'tree',
  HYBRID: 'hybrid',
  POINT_TO_POINT: 'point_to_point',
  POINT_TO_MULTIPOINT: 'point_to_multipoint'
} as const;

export const OSI_LAYERS = {
  PHYSICAL: 'physical',
  DATA_LINK: 'data_link',
  NETWORK: 'network',
  TRANSPORT: 'transport',
  SESSION: 'session',
  PRESENTATION: 'presentation',
  APPLICATION: 'application'
} as const;

export const NETWORK_ATTACKS = [
  'Man-in-the-Middle',
  'ARP Spoofing',
  'DNS Spoofing',
  'IP Spoofing',
  'Session Hijacking',
  'Packet Sniffing',
  'Network Scanning',
  'Port Scanning',
  'DDoS Attack',
  'DoS Attack',
  'Smurf Attack',
  'Ping of Death',
  'SYN Flood',
  'UDP Flood',
  'ICMP Flood',
  'Teardrop Attack',
  'Land Attack',
  'Fraggle Attack',
  'Buffer Overflow',
  'SQL Injection via Network',
  'Cross-Site Scripting',
  'CSRF Attack',
  'Evil Twin',
  'Rogue Access Point',
  'WPS Attack',
  'Deauthentication Attack',
  'Beacon Flooding',
  'KRACK Attack',
  'Bluesnarfing',
  'Bluejacking'
] as const;

export const NETWORK_MONITORING = {
  BANDWIDTH: 'bandwidth',
  LATENCY: 'latency',
  PACKET_LOSS: 'packet_loss',
  JITTER: 'jitter',
  THROUGHPUT: 'throughput',
  UTILIZATION: 'utilization',
  ERROR_RATE: 'error_rate',
  AVAILABILITY: 'availability',
  RESPONSE_TIME: 'response_time'
} as const;

export const QOS_CLASSES = {
  BEST_EFFORT: 'best_effort',
  BULK_DATA: 'bulk_data',
  INTERACTIVE: 'interactive',
  STREAMING: 'streaming',
  REAL_TIME: 'real_time',
  NETWORK_CONTROL: 'network_control',
  VOICE: 'voice',
  VIDEO: 'video',
  SIGNALING: 'signaling'
} as const;

export const VPN_TYPES = {
  SITE_TO_SITE: 'site_to_site',
  REMOTE_ACCESS: 'remote_access',
  CLIENT_TO_SITE: 'client_to_site',
  HOST_TO_HOST: 'host_to_host',
  SSL_VPN: 'ssl_vpn',
  IPSEC_VPN: 'ipsec_vpn',
  MPLS_VPN: 'mpls_vpn'
} as const;

export const ROUTING_PROTOCOLS = {
  STATIC: 'static',
  RIP: 'rip',
  RIPV2: 'ripv2',
  OSPF: 'ospf',
  ISIS: 'isis',
  EIGRP: 'eigrp',
  BGP: 'bgp',
  IGRP: 'igrp'
} as const;

export const NETWORK_ZONES = {
  INTERNET: 'internet',
  DMZ: 'dmz',
  INTERNAL: 'internal',
  MANAGEMENT: 'management',
  GUEST: 'guest',
  QUARANTINE: 'quarantine',
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TESTING: 'testing'
} as const;

export const FIREWALL_ACTIONS = {
  ALLOW: 'allow',
  DENY: 'deny',
  DROP: 'drop',
  REJECT: 'reject',
  LOG: 'log',
  ALERT: 'alert'
} as const;

export const PROXY_TYPES = {
  FORWARD: 'forward',
  REVERSE: 'reverse',
  TRANSPARENT: 'transparent',
  ANONYMOUS: 'anonymous',
  HIGH_ANONYMITY: 'high_anonymity',
  SOCKS4: 'socks4',
  SOCKS5: 'socks5',
  HTTP: 'http',
  HTTPS: 'https'
} as const;

export const CDN_PROVIDERS = [
  'Cloudflare',
  'Amazon CloudFront',
  'Akamai',
  'Google Cloud CDN',
  'Microsoft Azure CDN',
  'KeyCDN',
  'MaxCDN',
  'Fastly',
  'CloudFront',
  'BunnyCDN',
  'JSDelivr',
  'Cloudinary'
] as const;

export const LOAD_BALANCING_ALGORITHMS = {
  ROUND_ROBIN: 'round_robin',
  LEAST_CONNECTIONS: 'least_connections',
  WEIGHTED_ROUND_ROBIN: 'weighted_round_robin',
  WEIGHTED_LEAST_CONNECTIONS: 'weighted_least_connections',
  IP_HASH: 'ip_hash',
  LEAST_RESPONSE_TIME: 'least_response_time',
  RESOURCE_BASED: 'resource_based'
} as const;

export const NETWORK_SEGMENTS = {
  BROADCAST_DOMAIN: 'broadcast_domain',
  COLLISION_DOMAIN: 'collision_domain',
  SUBNET: 'subnet',
  VLAN: 'vlan',
  VRF: 'vrf'
} as const;

export const BANDWIDTH_UNITS = {
  BPS: 'bps',
  KBPS: 'kbps',
  MBPS: 'mbps',
  GBPS: 'gbps',
  TBPS: 'tbps'
} as const;

// Type definitions
export type NetworkProtocol = typeof NETWORK_PROTOCOLS[keyof typeof NETWORK_PROTOCOLS];
export type PortCategory = typeof PORT_CATEGORIES[keyof typeof PORT_CATEGORIES];
export type NetworkType = typeof NETWORK_TYPES[keyof typeof NETWORK_TYPES];
export type IPVersion = typeof IP_VERSIONS[keyof typeof IP_VERSIONS];
export type DNSRecordType = typeof DNS_RECORD_TYPES[keyof typeof DNS_RECORD_TYPES];
export type HTTPMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];
export type NetworkDevice = typeof NETWORK_DEVICES[keyof typeof NETWORK_DEVICES];
export type WirelessStandard = typeof WIRELESS_STANDARDS[keyof typeof WIRELESS_STANDARDS];
export type EncryptionProtocol = typeof ENCRYPTION_PROTOCOLS[keyof typeof ENCRYPTION_PROTOCOLS];
export type NetworkTopology = typeof NETWORK_TOPOLOGIES[keyof typeof NETWORK_TOPOLOGIES];
export type OSILayer = typeof OSI_LAYERS[keyof typeof OSI_LAYERS];
export type NetworkMonitoring = typeof NETWORK_MONITORING[keyof typeof NETWORK_MONITORING];
export type QOSClass = typeof QOS_CLASSES[keyof typeof QOS_CLASSES];
export type VPNType = typeof VPN_TYPES[keyof typeof VPN_TYPES];
export type RoutingProtocol = typeof ROUTING_PROTOCOLS[keyof typeof ROUTING_PROTOCOLS];
export type NetworkZone = typeof NETWORK_ZONES[keyof typeof NETWORK_ZONES];
export type FirewallAction = typeof FIREWALL_ACTIONS[keyof typeof FIREWALL_ACTIONS];
export type ProxyType = typeof PROXY_TYPES[keyof typeof PROXY_TYPES];
export type LoadBalancingAlgorithm = typeof LOAD_BALANCING_ALGORITHMS[keyof typeof LOAD_BALANCING_ALGORITHMS];
export type NetworkSegment = typeof NETWORK_SEGMENTS[keyof typeof NETWORK_SEGMENTS];
export type BandwidthUnit = typeof BANDWIDTH_UNITS[keyof typeof BANDWIDTH_UNITS];
