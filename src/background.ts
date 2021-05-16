import { ChromeMessage, JSSettingsDetails, Messages, Sender } from './types';

const getJSSettings = (jsParamsResponse: { setting: JSSettingsDetails }) => {
  return jsParamsResponse.setting === JSSettingsDetails.ALLOW
    ? JSSettingsDetails.BLOCK
    : JSSettingsDetails.ALLOW;
};
const disableJS = (
  url: string,
  chromeMessageResponse: (chromeMessageResponse: ChromeMessage) => void,
) => {
  const contentSettings = chrome.contentSettings.javascript;
  contentSettings.get({ primaryUrl: url }, (jsParamsResponse) => {
    contentSettings.clear({}, () => {
      contentSettings.set(
        {
          primaryPattern: `*://${new URL(url).host}/*`,
          setting: getJSSettings(jsParamsResponse),
        },
        () => {
          chromeMessageResponse({
            from: Sender.Background,
            payload: getJSSettings(jsParamsResponse),
            type: Messages.DisableJS,
          });
        },
      );
    });
  });
};

const debug = (
  tabId: number,
  chromeMessageResponse: (chromeMessageResponse: ChromeMessage) => void,
) => {
  const requiredVersion = '1.1';
  chrome.debugger.attach({ tabId }, requiredVersion, () => {
    if (!chrome.runtime.lastError) {
      chrome.debugger.getTargets((targets) => {
        console.log('targets', targets);
        chrome.debugger.sendCommand(
          {
            tabId,
          },
          'Debugger.setBreakpoint',
          {
            location: {
              lineNumber: 0,
              scriptId: 'doabdpfpcfpobdhfnbmpclinclffoign',
              url: 'https://ronic7.wixsite.com/my-site-2',
            },
          },
          (res) => {
            console.log('res', JSON.stringify(res));
            chromeMessageResponse({
              from: Sender.Background,
              payload: tabId,
              type: Messages.Debug,
            });
          },
        );
      });
    } else {
      console.log('err!', chrome.runtime.lastError);
    }
  });
};

const getConfig = (
  url: string,
  chromeMessageResponse: (chromeMessageResponse: ChromeMessage) => void,
) => {
  chrome.devtools.network.onRequestFinished.addListener((request) => {
    if (request.request.url.includes('facebook.com')) {
      request.getContent((body) => {
        if (request.request && request.request.url) {
          console.log(JSON.parse(body));
          chromeMessageResponse({
            from: Sender.Background,
            payload: getJSSettings(JSON.parse(body)),
            type: Messages.GetConfig,
          });
        }
      });
    }
  });
};
const messagesFromContentAppListener = (
  chromeMessage: ChromeMessage,
  sender: any,
  response?: (chromeMessageResponse: ChromeMessage) => void,
) => {
  switch (chromeMessage.payload.type) {
    case Messages.DisableJS:
      disableJS(chromeMessage.payload.url, response);
      break;
    case Messages.Debug:
      debug(chromeMessage.payload.tabId, response);
      break;
    case Messages.GetConfig:
      getConfig(chromeMessage.payload.url, response);
      break;
  }
  return true;
};
chrome.runtime.onMessage.addListener(messagesFromContentAppListener);
