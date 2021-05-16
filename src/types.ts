export enum Sender {
  React,
  Content,
  Background,
}

export enum Messages {
  ClearCache,
  RenderMode,
  DisableJS,
  ParseURL,
  Decode,
  Encode,
  Debug,
  GetConfig,
  SiteDetails,
  ToggleMobileView,
  IsMobileView,
}

export enum RenderModes {
  CSRBolt = 'CSR Bolt',
  CSRThunderBolt = 'CSR ThunderBolt',
  Bolt = 'SSR Bolt',
  ThunderBolt = 'SSR ThunderBolt',
}

export enum TabTitles {
  RenderMode = 'Render Modes',
  Base64 = 'Base 64',
  ParseURLParams = 'Parse URL params',
  Other = 'Other',
  UnderConstruction = 'Under construction',
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
