import React, { useEffect, useState } from 'react';
import {
  ChromeMessage,
  JSSettingsDetails,
  Messages,
  Sender,
  RenderModes,
} from '../../types';
import s from './App.scss';

import {
  Button,
  RadioGroup,
  Divider,
  Layout,
  ToggleSwitch,
  FormField,
  Accordion,
  Text,
  accordionItemBuilder,
  InputArea,
  Box,
  Card,
  Radio,
  Cell,
} from 'wix-style-react';
// import ChevronRight from 'wix-ui-icons-common/ChevronRight';

export function App() {
  const [renderModeVal, setRenderModeVal] = useState<RenderModes>();
  const [jsDisable, setJsDisable] = useState<string>('');
  const [textToParse, setTextToParse] = useState<string>('');
  const [parseURLParams, setParseURLParams] = useState([]);

  useEffect(() => {
    parseURL();
    const queryInfo: chrome.tabs.QueryInfo = {
      active: true,
      currentWindow: true,
    };
    chrome.tabs &&
      chrome.tabs.query(queryInfo, (tabs) => {
        setTextToParse(tabs[0].url ?? '');
        const contentSettings = chrome.contentSettings.javascript;
        contentSettings.get(
          { primaryUrl: tabs[0].url ?? '' },
          (jsParamsResponse) => {
            setJsDisable(jsParamsResponse.setting);
          },
        );
      });
  }, []);

  const sendMessage = (chromeMessage: ChromeMessage) => {
    const queryInfo: chrome.tabs.QueryInfo = {
      active: true,
      currentWindow: true,
    };
    chrome.tabs?.query(queryInfo, (tabs) => {
      const currentTabId = tabs[0].id;
      currentTabId &&
        chrome.tabs.sendMessage(
          currentTabId,
          chromeMessage,
          (response: ChromeMessage) => {
            switch (response.type) {
              case Messages.DisableJS:
                setJsDisable(response.payload);
                break;
              case Messages.Decode:
              case Messages.Encode:
                break;
              case Messages.ParseURL:
                setParseURLParams(response.payload);
                break;
              case Messages.ClearCache:
                break;
              case Messages.renderMode:
                setRenderModeVal(response.payload);
                break;
            }
          },
        );
    });
  };

  const clearCache = () => {
    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      payload: { type: Messages.ClearCache },
    };
    sendMessage(chromeMessage);
  };

  const renderMode = (mode: RenderModes) => {
    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      payload: { type: Messages.renderMode, renderMode: mode },
    };
    sendMessage(chromeMessage);
  };

  const disableJS = () => {
    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      payload: { type: Messages.DisableJS },
    };
    sendMessage(chromeMessage);
  };

  const parseURL = () => {
    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      payload: { type: Messages.ParseURL },
    };
    sendMessage(chromeMessage);
  };

  const decodeEncode = (decodeEncodeStr: Messages.Decode | Messages.Encode) => {
    decodeEncodeStr === Messages.Decode
      ? setTextToParse(atob(textToParse))
      : setTextToParse(btoa(textToParse));
  };

  const isJSDisabled = () => {
    return jsDisable !== JSSettingsDetails.ALLOW;
  };

  const renderModesComponent = () => {
    return (
      <Layout cols={2} gap={10}>
        <Radio
          label={RenderModes.CSRBolt}
          checked={renderModeVal === RenderModes.CSRBolt}
          onChange={() => renderMode(RenderModes.CSRBolt)}
        />
        <Radio
          label={RenderModes.CSRThunderBolt}
          checked={renderModeVal === RenderModes.CSRThunderBolt}
          onChange={() => renderMode(RenderModes.CSRThunderBolt)}
        />
        <Radio
          label={RenderModes.Bolt}
          checked={renderModeVal === RenderModes.Bolt}
          onChange={() => renderMode(RenderModes.Bolt)}
        />
        <Radio
          label={RenderModes.ThunderBolt}
          checked={renderModeVal === RenderModes.ThunderBolt}
          onChange={() => renderMode(RenderModes.ThunderBolt)}
        />
      </Layout>
    );
  };
  const encodeDecodeComponent = () => {
    return (
      <>
        <InputArea
          minHeight="150px"
          resizable={true}
          placeholder="Insert Text to Parse"
          onChange={(e) => setTextToParse(e.target.value)}
          value={textToParse}
        />
        <div className={s.encodeDecodeButtons} style={{ marginTop: '10px' }}>
          <Layout cols={2} gap={2}>
            <Button onClick={() => decodeEncode(Messages.Decode)}>
              base 64 Decode
            </Button>
            <Button onClick={() => decodeEncode(Messages.Encode)}>
              base 64 Encode
            </Button>
          </Layout>
        </div>
      </>
    );
  };
  const parseURLParamsComponent = () =>
    parseURLParams.map((param: any) => {
      return (
        <>
          <Layout gap={10} key={param[0]}>
            <Cell span={4}>
              <Box>
                <Text>{decodeURIComponent(param[0])}</Text>
              </Box>
            </Cell>
            <Cell span={8}>
              <Box>
                <Text>
                  {param[0] === 'petri_ovr'
                    ? decodeURIComponent(param[1])
                        .split(';')
                        .map((petriParam: string) => (
                          <p key={petriParam} data-at={petriParam}>
                            {decodeURIComponent(petriParam)}
                          </p>
                        ))
                    : decodeURIComponent(param[1])}
                </Text>
              </Box>
            </Cell>
          </Layout>
          <Divider />
        </>
      );
    });
  const otherOptionsComponent = () => (
    <>
      <Layout cols={4} gap={2}>
        <FormField id="disableJS" label="Disable JS" labelPlacement="right">
          <ToggleSwitch
            id="disableJS"
            skin="error"
            checked={isJSDisabled()}
            onChange={() => disableJS()}
          />
        </FormField>

        <Button onClick={clearCache}>Clean Storage</Button>
      </Layout>
      <Divider />
    </>
  );

  return (
    <Card>
      <Card.Header title="BumbleBee" subtitle="Bookings develop helper" />
      <Card.Divider />
      <Accordion
        size="small"
        items={[
          accordionItemBuilder({
            title: 'Render Modes',
            children: renderModesComponent(),
          }),
          accordionItemBuilder({
            title: 'Encode/Decode',
            children: encodeDecodeComponent(),
          }),
          accordionItemBuilder({
            title: 'parse URL params',
            children: parseURLParamsComponent(),
          }),
          accordionItemBuilder({
            title: 'other options',
            children: otherOptionsComponent(),
          }),
        ]}
      />
    </Card>
  );
}

export default App;
