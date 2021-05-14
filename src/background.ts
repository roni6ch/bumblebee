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

// const getConfig = (
//   url: string,
//   chromeMessageResponse: (chromeMessageResponse: ChromeMessage) => void,
// ) => {
//   chrome.devtools.network.onRequestFinished.addListener((request) => {
//     request.getContent((body) => {
//       debugger;
//       if (request.request && request.request.url) {
//         console.log(JSON.parse(body));
//         chromeMessageResponse({
//           from: Sender.Background,
//           payload: getJSSettings(JSON.parse(body)),
//           type: Messages.GetConfig,
//         });
//         // if (request.request.url.includes('facebook.com')) {
//         //   // continue with custom code
//         //   const bodyObj = JSON.parse(body); // etc.
//         // }
//       }
//     });
//   });
// };
const messagesFromContentAppListener = (
  chromeMessage: ChromeMessage,
  sender: any,
  response?: (chromeMessageResponse: ChromeMessage) => void,
) => {
  switch (chromeMessage.payload.type) {
    case Messages.DisableJS:
      disableJS(chromeMessage.payload.url, response);
      break;
    // case Messages.GetConfig:
    //   getConfig(chromeMessage.payload.url, response);
    //   break;
  }
  return true;
};
chrome.runtime.onMessage.addListener(messagesFromContentAppListener);
