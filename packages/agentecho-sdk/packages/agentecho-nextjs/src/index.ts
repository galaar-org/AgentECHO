export { createAgentECHO, createNextJSAgentECHO, NextJSProxyAdapter } from './proxy-adapter';
export { extractRequestData, extractIpAddress, shouldCapture } from './utils';

export type {
  NextJSAgentECHOClient,
  CreateNextJSAgentECHOOptions,
} from './types';

export type {
  AgentECHOConfig,
  AgentECHOEvent,
  EventData,
} from '@galaar/agentecho-core';
