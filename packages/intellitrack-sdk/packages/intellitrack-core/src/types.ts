export interface IntelliTrackConfig {
  ingestUrl: string;
  keyId: string;
  hmacSecret: string;
  sampleRate?: number;
  timeout?: number;
  debug?: boolean;
}

export interface IntelliTrackEvent {
  version: string;
  eventType: string;
  requestId: string;
  timestamp: string;
  nonce: string;
  keyId: string;
  method?: string;
  pathname?: string;
  search?: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  tags?: Record<string, string>;
  metrics?: Record<string, number>;
}

export interface EventData {
  method?: string;
  pathname?: string;
  search?: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  tags?: Record<string, string>;
  metrics?: Record<string, number>;
}

export interface SignedPayload {
  body: string;
  headers: {
    'Content-Type': string;
    'X-API-Key': string;
    'x-intellitrack-key-id': string;
    'x-intellitrack-ts': string;
    'x-intellitrack-signature': string;
  };
}

export interface Transport {
  send(url: string, payload: SignedPayload): Promise<void>;
}

export interface EventBuilder {
  build(data: EventData): IntelliTrackEvent;
}

export interface Sampler {
  shouldSample(requestId: string): Promise<boolean>;
}

export interface Signer {
  sign(body: string, timestamp: number): Promise<SignedPayload>;
}
