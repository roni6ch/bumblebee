declare const window: any;
import { ChromeMessage, Messages, Sender, RenderModes } from '../types';

const messagesFromReactAppListener = (
  chromeMessage: ChromeMessage,
  sender: any,
  response?: (chromeMessageResponse: ChromeMessage) => void,
) => {
  const url = window.location.href;
  let chromeContentMessage: ChromeMessage;
  if (sender.id === chrome.runtime.id && chromeMessage.from === Sender.React) {
    const payload = chromeMessage.payload;
    const searchParams = new URLSearchParams(window.location.search);
    switch (payload.type) {
      case Messages.IsMobileView:
        response({
          from: Sender.Content,
          payload: searchParams.get('showMobileView') === 'true',
          type: Messages.IsMobileView,
        });
        break;
      case Messages.ToggleMobileView:
        searchParams.set('showMobileView', payload.isMobileView);
        window.location.search = searchParams.toString();
        break;
      case Messages.MetaSiteID:
        // JSON.parse(document.querySelector('#wix-viewer-model').text)
        const metaSiteID = document
          .querySelector('meta[http-equiv="X-Wix-Meta-Site-Id"]')
          .getAttribute('content');
        const siteID = document
          .querySelector('meta[http-equiv="X-Wix-Application-Instance-Id"]')
          .getAttribute('content');
        const siteDetails = {
          metaSiteID,
          siteID,
        };
        response({
          from: Sender.Content,
          payload: siteDetails,
          type: Messages.MetaSiteID,
        });
        break;
      case Messages.Debug:
        chromeContentMessage = {
          from: Sender.Content,
          payload: { type: Messages.Debug, url, tabId: payload.tabId },
        };
        chrome.runtime.sendMessage(chromeContentMessage, (result) => {
          response({
            from: Sender.Content,
            payload: result.payload,
            type: Messages.Debug,
          });
        });

        break;
      case Messages.GetConfig:
        chromeContentMessage = {
          from: Sender.Content,
          payload: { type: Messages.GetConfig, url, tabId: payload.tabId },
        };
        chrome.runtime.sendMessage(chromeContentMessage, (result) => {
          response({
            from: Sender.Content,
            payload: result.payload,
            type: Messages.GetConfig,
          });
        });
        break;
      case Messages.DisableJS:
        chromeContentMessage = {
          from: Sender.Content,
          payload: { type: Messages.DisableJS, url },
        };
        chrome.runtime.sendMessage(chromeContentMessage, (result) => {
          response({
            from: Sender.Content,
            payload: result.payload,
            type: Messages.DisableJS,
          });
          window.location.reload();
        });
        break;
      case Messages.ClearCache:
        localStorage.clear();
        sessionStorage.clear();
        response({
          from: Sender.Content,
          payload: 'Cache Cleared!',
          type: Messages.ClearCache,
        });
        break;
      case Messages.ParseURL:
        const urlParams = Object.entries(
          JSON.parse(
            '{"' +
              decodeURI(window.location.search.substring(1))
                .replace(/"/g, '\\"')
                .replace(/&/g, '","')
                .replace(/=/g, '":"') +
              '"}',
          ),
        );
        response({
          from: Sender.Content,
          payload: urlParams,
          type: Messages.ParseURL,
        });
        break;
      case Messages.renderMode:
        searchParams.delete('ssrOnly');
        searchParams.delete('ssrWarmupOnly');
        searchParams.delete('petri_ovr');
        switch (payload.renderMode) {
          case RenderModes.ThunderBolt:
            searchParams.set('ssrOnly', 'true');
            break;
          case RenderModes.Bolt:
            searchParams.set(
              'petri_ovr',
              'specs.EnableThunderboltRenderer:false',
            );
            searchParams.set('ssrWarmupOnly', 'true');
            break;
          case RenderModes.CSRBolt:
            searchParams.set(
              'petri_ovr',
              'specs.EnableThunderboltRenderer:false;specs.ExcludeSiteFromSsr:true',
            );
            break;
          case RenderModes.CSRThunderBolt:
            searchParams.set('petri_ovr', 'specs.ExcludeSiteFromSsr:true');
            break;
        }
        window.location.search = searchParams.toString();
        response({
          from: Sender.Content,
          payload: payload.renderMode,
          type: Messages.renderMode,
        });
        break;
    }
    return true;
  }
};
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
