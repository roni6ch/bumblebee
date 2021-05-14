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
    switch (payload.type) {
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
      // case Messages.Decode:
      // case Messages.Encode:
      //   chromeContentMessage = {
      //     from: Sender.Content,
      //     payload: { type: chromeMessage.type, url },
      //   };
      //   chrome.runtime.sendMessage(chromeContentMessage, (result) => {
      //     response({
      //       from: Sender.Content,
      //       payload: result.payload,
      //       type: chromeMessage.type,
      //     });
      //   });
      //   break;
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
        const searchParams = new URLSearchParams(window.location.search);
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
