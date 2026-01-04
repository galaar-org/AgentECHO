export { createIntelliTrack, createNextJSIntelliTrack, NextJSProxyAdapter } from './proxy-adapter';
export { extractRequestData, extractIpAddress, shouldCapture } from './utils';

export type {
  NextJSIntelliTrackClient,
  CreateNextJSIntelliTrackOptions,
} from './types';

export type {
  IntelliTrackConfig,
  IntelliTrackEvent,
  EventData,
} from '@intellitrack/core';
