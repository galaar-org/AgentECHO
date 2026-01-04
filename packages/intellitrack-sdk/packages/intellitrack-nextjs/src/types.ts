import type { IntelliTrackConfig } from '@intellitrack/core';
import type { NextRequest, NextFetchEvent } from 'next/server';

export interface NextJSIntelliTrackClient {
  capture(req: NextRequest, event: NextFetchEvent): void;
}

export interface CreateNextJSIntelliTrackOptions extends IntelliTrackConfig {
  excludePaths?: string[];
  debug?: boolean;
}
