/**
 * Type definitions for laravel-echo
 * Since @types/laravel-echo is not available, we define the minimal types we need
 */

export interface EchoOptions {
  broadcaster?: string
  host?: string
  port?: number
  key?: string
  wsHost?: string
  wsPort?: number
  wssHost?: string
  wssPort?: number
  forceTLS?: boolean
  encrypted?: boolean
  disableStats?: boolean
  enabled?: boolean
  reconnectAttempts?: number
  reconnectWait?: number
  authorizer?: (channel: any, options: any) => {
    authorize: (socketId: string, callback: Function) => void
  }
  client?: any
}

export interface Channel {
  listen(event: string, callback: Function): Channel
  listenForWhisper(event: string, callback: Function): Channel
  notification(callback: Function): Channel
  stopListening(event: string, callback?: Function): Channel
  subscribe(): Channel
  unsubscribe(): Channel
}

export interface PrivateChannel extends Channel {
  listen(event: string, callback: Function): PrivateChannel
  listenForWhisper(event: string, callback: Function): PrivateChannel
}

export interface PresenceChannel extends Channel {
  here(callback: Function): PresenceChannel
  joining(callback: Function): PresenceChannel
  leaving(callback: Function): PresenceChannel
  listen(event: string, callback: Function): PresenceChannel
}

export interface EchoInterface {
  channel(channelName: string): Channel
  private(channelName: string): PrivateChannel
  presence(channelName: string): PresenceChannel
  leave(channelName: string): void
  disconnect(): void
  connect(): void
  connector: any
  options: EchoOptions
  socketId(): string
}

declare const EchoClass: {
  new (options: EchoOptions): EchoInterface
}

export default EchoClass
