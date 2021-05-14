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

export enum JSSettingsDetails {
  ALLOW = 'allow',
  BLOCK = 'block',
}
