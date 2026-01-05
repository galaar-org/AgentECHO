import type { AgentECHOConfig } from '@galaar/agentecho-core';
import type { NextRequest, NextFetchEvent } from 'next/server';

export interface NextJSAgentECHOClient {
  capture(req: NextRequest, event: NextFetchEvent): void;
}

export interface CreateNextJSAgentECHOOptions extends AgentECHOConfig {
  excludePaths?: string[];
  debug?: boolean;
}
