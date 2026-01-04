import type { IntelliTrackClient } from '@intellitrack/core';
import { createIntelliTrackClient } from '@intellitrack/core';
import type { NextFetchEvent, NextRequest } from 'next/server';
import type { CreateNextJSIntelliTrackOptions, NextJSIntelliTrackClient } from './types';
import { extractRequestData, shouldCapture } from './utils';

export class NextJSProxyAdapter implements NextJSIntelliTrackClient {
  private readonly coreClient: IntelliTrackClient;
  private readonly excludePaths: string[];
  private readonly debug: boolean;

  constructor(options: CreateNextJSIntelliTrackOptions) {
    this.coreClient = createIntelliTrackClient(options);
    this.excludePaths = options.excludePaths || [];
    this.debug = options.debug ?? false;
  }

  capture(req: NextRequest, event: NextFetchEvent): void {
    try {
      const pathname = req.nextUrl.pathname;

      if (!shouldCapture(pathname, this.excludePaths)) {
        if (this.debug) {
          console.log(`[IntelliTrack] Skipping: ${pathname}`);
        }
        return;
      }

      const data = extractRequestData(req);

      event.waitUntil(
        Promise.resolve().then(() => {
          this.coreClient.captureEvent(data);
        })
      );

      if (this.debug) {
        console.log(`[IntelliTrack] Scheduled: ${pathname}`);
      }
    } catch (error) {
      if (this.debug) {
        console.warn('[IntelliTrack] Error:', error);
      }
    }
  }
}

export function createIntelliTrack(options: CreateNextJSIntelliTrackOptions): NextJSIntelliTrackClient {
  return new NextJSProxyAdapter(options);
}

export const createNextJSIntelliTrack = createIntelliTrack;
