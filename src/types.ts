export enum Sender {
  React,
  Content,
  Background,
}

export enum Messages {
  ClearCache,
  renderMode,
  DisableJS,
  ParseURL,
  Decode,
  Encode,
  Debug,
  GetConfig,
  MetaSiteID,
  ToggleMobileView,
  IsMobileView,
}

export enum RenderModes {
  CSRBolt = 'CSR Bolt',
  CSRThunderBolt = 'CSR ThunderBolt',
  Bolt = 'SSR Bolt',
  ThunderBolt = 'SSR ThunderBolt',
}

export interface ChromeMessage {
  from: Sender;
  payload: any;
  type?: Messages;
}

export interface SiteDetails {
  metaSiteID: string;
  siteID: string;
}

export enum JSSettingsDetails {
  ALLOW = 'allow',
  BLOCK = 'block',
}
