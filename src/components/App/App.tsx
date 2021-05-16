import React, { useEffect, useState } from 'react';
import {
  ChromeMessage,
  JSSettingsDetails,
  Messages,
  Sender,
  RenderModes,
  SiteDetails,
} from '../../types';
import s from './App.scss';

import {
  Button,
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
  CardFolderTabs,
  EmptyState,
  TextButton,
} from 'wix-style-react';
import Delete from 'wix-ui-icons-common/Delete';
import OpenModal from 'wix-ui-icons-common/OpenModal';
import ContentFilter from 'wix-ui-icons-common/ContentFilter';
import More from 'wix-ui-icons-common/More';
import ChangeOrder from 'wix-ui-icons-common/ChangeOrder';
import FaceGrining from 'wix-ui-icons-common/FaceGrining';
import FaceDisapointed from 'wix-ui-icons-common/FaceDisapointed';
import SiteSearch from 'wix-ui-icons-common/SiteSearch';
import Toolbox from 'wix-ui-icons-common/Toolbox';
import Database from 'wix-ui-icons-common/Database';

export function App() {
  const [tabId, setTabId] = useState<number>(0);
  const [tabUrl, setTabUrl] = useState<string>('');
  const [siteDetails, setSiteDetails] = useState<SiteDetails>({
    metaSiteID: '',
    siteID: '',
  });
  const [renderModeVal, setRenderModeVal] = useState<RenderModes>();
  const [jsDisable, setJsDisable] = useState<string>('');
  const [textToParse, setTextToParse] = useState<string>('');
  const [parseURLParams, setParseURLParams] = useState([]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  useEffect(() => {
    parseURL();
    getSiteDetails();
    checkIsMobileView();
    const queryInfo: chrome.tabs.QueryInfo = {
      active: true,
      currentWindow: true,
    };
    chrome.tabs &&
      chrome.tabs.query(queryInfo, (tabs) => {
        setTabId(tabs[0].id ?? 0);
        setTabUrl(tabs[0].url ?? '0');
        setTextToParse(decodeURIComponent(tabs[0].url ?? ''));
        const contentSettings = chrome.contentSettings.javascript;
        contentSettings.get(
          { primaryUrl: tabs[0].url ?? '' },
          (jsParamsResponse) => {
            setJsDisable(jsParamsResponse.setting);
          },
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            switch (response?.type) {
              case Messages.IsMobileView:
                setIsMobileView(response.payload);
                break;
              case Messages.GetConfig:
                console.log('GetConfig', response);
                break;
              case Messages.Debug:
                console.log('response', response);
                break;
              case Messages.MetaSiteID:
                setSiteDetails(response.payload);
                break;
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

  const getSiteDetails = () => {
    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      payload: { type: Messages.MetaSiteID },
    };
    sendMessage(chromeMessage);
  };

  const checkIsMobileView = () => {
    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      payload: { type: Messages.IsMobileView },
    };
    sendMessage(chromeMessage);
  };

  const toggleMobileView = () => {
    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      payload: {
        type: Messages.ToggleMobileView,
        isMobileView: isMobileView ? false : true,
      },
    };
    setIsMobileView(isMobileView ? false : true);
    sendMessage(chromeMessage);
  };

  const debuggerHandle = () => {
    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      payload: { type: Messages.Debug, tabId },
    };
    sendMessage(chromeMessage);
  };

  const getConfig = () => {
    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      payload: { type: Messages.GetConfig, tabId },
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
            <Button
              onClick={() => decodeEncode(Messages.Decode)}
              prefixIcon={<FaceGrining />}
            >
              Decode
            </Button>
            <Button
              onClick={() => decodeEncode(Messages.Encode)}
              prefixIcon={<FaceDisapointed />}
            >
              Encode
            </Button>
          </Layout>
        </div>
      </>
    );
  };
  const parseURLParamsComponent = () =>
    parseURLParams.length > 0 ? (
      parseURLParams.map((param: any) => {
        return (
          <div key={param[0]}>
            <Layout gap={10}>
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
            <Divider></Divider>
          </div>
        );
      })
    ) : (
      <Text skin="error">Theres no query parmeters!</Text>
    );
  const otherOptionsComponent = () => (
    <Layout cols={3} gap={2}>
      <FormField
        id="disableJS"
        label="Disable JS"
        labelPlacement="right"
        stretchContent={false}
      >
        <ToggleSwitch
          id="disableJS"
          skin="error"
          checked={isJSDisabled()}
          onChange={() => disableJS()}
        />
      </FormField>
      <FormField
        id="mobileView"
        label="Mobile View"
        labelPlacement="right"
        stretchContent={false}
      >
        <ToggleSwitch
          id="mobileView"
          checked={isMobileView}
          onChange={() => toggleMobileView()}
        />
      </FormField>

      <Button
        priority="secondary"
        onClick={() => clearCache()}
        size="small"
        fullWidth={false}
        prefixIcon={<Delete />}
      >
        Storage
      </Button>
    </Layout>
  );
  const underConstruction = () => (
    <Layout cols={3} gap={2}>
      <Button
        priority="secondary"
        onClick={() => debuggerHandle()}
        size="small"
        fullWidth={false}
        prefixIcon={<SiteSearch />}
      >
        Debugger
      </Button>
      <Button
        priority="secondary"
        onClick={() => getConfig()}
        size="small"
        fullWidth={false}
        prefixIcon={<Database />}
      >
        Get Config
      </Button>
    </Layout>
  );

  return (
    <Card>
      <Card.Header
        title="BumbleBee"
        subtitle={`Bookings develop helper \nSite ID: ${siteDetails.siteID} \nMeta Site ID: ${siteDetails.metaSiteID}`}
      />
      <Card.Divider />
      <Accordion
        size="small"
        transitionSpeed="fast"
        items={[
          accordionItemBuilder({
            title: `Render Modes`,
            icon: <OpenModal />,
            collapseLabel: 'Less',
            expandLabel: 'See More',
            children: renderModesComponent(),
          }),
          accordionItemBuilder({
            title: 'Base 64',
            icon: <ChangeOrder />,
            collapseLabel: 'Less',
            expandLabel: 'See More',
            children: encodeDecodeComponent(),
          }),
          accordionItemBuilder({
            title: 'Parse URL params',
            icon: <ContentFilter />,
            collapseLabel: 'Less',
            expandLabel: 'See More',
            children: (
              <div
                style={{
                  maxHeight: parseURLParams.length > 0 ? '200px' : '30px',
                  overflowY: 'scroll',
                }}
              >
                {parseURLParamsComponent()}
              </div>
            ),
          }),
          accordionItemBuilder({
            title: 'Other',
            icon: <More />,
            collapseLabel: 'Less',
            expandLabel: 'See More',
            children: otherOptionsComponent(),
          }),
          accordionItemBuilder({
            title: 'Under construction',
            icon: <Toolbox />,
            collapseLabel: 'Less',
            expandLabel: 'See More',
            children: underConstruction(),
          }),
        ]}
      />
      {/* <CardFolderTabs
        activeId={activeTabId}
        // eslint-disable-next-line @typescript-eslint/no-shadow
        onTabChange={(activeTabId: string) => setActiveTabId(activeTabId)}
      >
        <CardFolderTabs.Tab id="1" name="Render Modes">
          <Card>
            <Card.Content>{renderModesComponent()}</Card.Content>
          </Card>
        </CardFolderTabs.Tab>
        <CardFolderTabs.Tab id="2" name="Base 64">
          <Card>
            <Card.Content>{encodeDecodeComponent()}</Card.Content>
          </Card>
        </CardFolderTabs.Tab>
        <CardFolderTabs.Tab id="3" name="Parse URL params">
          <Card>
            <Card.Content>{parseURLParamsComponent()}</Card.Content>
          </Card>
        </CardFolderTabs.Tab>
        <CardFolderTabs.Tab id="4" name="Other">
          <Card>
            <Card.Content>{otherOptionsComponent()}</Card.Content>
          </Card>
        </CardFolderTabs.Tab>
      </CardFolderTabs> */}
    </Card>
  );
}

export default App;
