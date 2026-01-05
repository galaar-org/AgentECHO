import type { AgentECHOClient } from '@galaar/agentecho-core';
import { createAgentECHOClient } from '@galaar/agentecho-core';
import type { NextFetchEvent, NextRequest } from 'next/server';
import type { CreateNextJSAgentECHOOptions, NextJSAgentECHOClient } from './types';
import { extractRequestData, shouldCapture } from './utils';

export class NextJSProxyAdapter implements NextJSAgentECHOClient {
  private readonly coreClient: AgentECHOClient;
  private readonly excludePaths: string[];
  private readonly debug: boolean;

  constructor(options: CreateNextJSAgentECHOOptions) {
    this.coreClient = createAgentECHOClient(options);
    this.excludePaths = options.excludePaths || [];
    this.debug = options.debug ?? false;
  }

  capture(req: NextRequest, event: NextFetchEvent): void {
    try {
      const pathname = req.nextUrl.pathname;

      if (!shouldCapture(pathname, this.excludePaths)) {
        if (this.debug) {
          console.log(`[AgentECHO] Skipping: ${pathname}`);
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
        console.log(`[AgentECHO] Scheduled: ${pathname}`);
      }
    } catch (error) {
      if (this.debug) {
        console.warn('[AgentECHO] Error:', error);
      }
    }
  }
}

export function createAgentECHO(options: CreateNextJSAgentECHOOptions): NextJSAgentECHOClient {
  return new NextJSProxyAdapter(options);
}

export const createNextJSAgentECHO = createAgentECHO;
