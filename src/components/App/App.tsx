import React, { useEffect, useState } from 'react';
import {
  ChromeMessage,
  JSSettingsDetails,
  Messages,
  Sender,
  RenderModes,
  SiteDetails,
  TabTitles,
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
  const [queryInfo] = useState<chrome.tabs.QueryInfo>({
    active: true,
    currentWindow: true,
  });
  const [renderModeVal, setRenderModeVal] = useState<RenderModes>();
  const [jsDisable, setJsDisable] = useState<string>('');
  const [textToParse, setTextToParse] = useState<string>('');
  const [parseURLParams, setParseURLParams] = useState<string[]>([]);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [siteDetails, setSiteDetails] = useState<SiteDetails>({
    metaSiteID: '',
    siteID: '',
  });
  // const [activeTabId, setActiveTabId] = useState<string>('1');

  useEffect(() => {
    sendMessage({ type: Messages.ParseURL });
    sendMessage({ type: Messages.SiteDetails });
    sendMessage({ type: Messages.IsMobileView });
    chrome.tabs?.query(queryInfo, (tabs) => {
      const tabUrl = tabs[0].url ?? '';
      setTabId(tabs[0].id ?? 0);
      setTextToParse(decodeURIComponent(tabUrl));
      const contentSettings = chrome.contentSettings.javascript;
      contentSettings.get({ primaryUrl: tabUrl }, (jsParamsResponse) =>
        setJsDisable(jsParamsResponse.setting),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = (payload: any) => {
    const chromeMessage: ChromeMessage = {
      from: Sender.React,
      payload,
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
              case Messages.SiteDetails:
                setSiteDetails(response.payload);
                break;
              case Messages.DisableJS:
                setJsDisable(response.payload);
                break;
              case Messages.ParseURL:
                setParseURLParams(response.payload);
                break;
              case Messages.RenderMode:
                setRenderModeVal(response.payload);
                break;
              case Messages.GetConfig:
                console.log('GetConfig', response);
                break;
              case Messages.Debug:
                console.log('response', response);
                break;
            }
          },
        );
    });
  };

  const toggleMobileView = () => {
    const toggleMobileViewValue = isMobileView ? false : true;
    setIsMobileView(toggleMobileViewValue);
    sendMessage({
      type: Messages.ToggleMobileView,
      isMobileView: toggleMobileViewValue,
    });
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
      <div className="tracking-in-expand">
        <Layout cols={2} gap={10}>
          <Radio
            label={RenderModes.CSRBolt}
            checked={renderModeVal === RenderModes.CSRBolt}
            onChange={() =>
              sendMessage({
                type: Messages.RenderMode,
                renderMode: RenderModes.CSRBolt,
              })
            }
          />
          <Radio
            label={RenderModes.CSRThunderBolt}
            checked={renderModeVal === RenderModes.CSRThunderBolt}
            onChange={() =>
              sendMessage({
                type: Messages.RenderMode,
                renderMode: RenderModes.CSRThunderBolt,
              })
            }
          />
          <Radio
            label={RenderModes.Bolt}
            checked={renderModeVal === RenderModes.Bolt}
            onChange={() =>
              sendMessage({
                type: Messages.RenderMode,
                renderMode: RenderModes.Bolt,
              })
            }
          />
          <Radio
            label={RenderModes.ThunderBolt}
            checked={renderModeVal === RenderModes.ThunderBolt}
            onChange={() =>
              sendMessage({
                type: Messages.RenderMode,
                renderMode: RenderModes.ThunderBolt,
              })
            }
          />
        </Layout>
      </div>
    );
  };
  const encodeDecodeComponent = () => {
    return (
      <div className="jello-horizontal">
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
      </div>
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
    <div className="slide-in-blurred-top">
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
            onChange={() => sendMessage({ type: Messages.DisableJS })}
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
          onClick={() => sendMessage({ type: Messages.ClearCache })}
          size="small"
          fullWidth={false}
          prefixIcon={<Delete />}
        >
          Storage
        </Button>
      </Layout>
    </div>
  );
  const underConstructionComponent = () => (
    <div>
      <Layout cols={3} gap={2}>
        <Button
          className="roll-in-blurred-left"
          priority="secondary"
          onClick={() => sendMessage({ type: Messages.Debug, tabId })}
          size="small"
          fullWidth={false}
          prefixIcon={<SiteSearch />}
        >
          Debugger
        </Button>
        <Button
          className="roll-in-blurred-left"
          priority="secondary"
          onClick={() => sendMessage({ type: Messages.GetConfig, tabId })}
          size="small"
          fullWidth={false}
          prefixIcon={<Database />}
        >
          Get Config
        </Button>
      </Layout>
    </div>
  );

  const componentsItems = [
    {
      title: TabTitles.RenderMode,
      icon: <OpenModal />,
      children: renderModesComponent(),
    },
    {
      title: TabTitles.Base64,
      icon: <ChangeOrder />,
      children: encodeDecodeComponent(),
    },
    {
      title: TabTitles.ParseURLParams,
      icon: <ContentFilter />,
      children: (
        <div
          className="text-focus-in"
          style={{
            maxHeight: parseURLParams.length > 0 ? '200px' : '30px',
            overflowY: 'scroll',
          }}
        >
          {parseURLParamsComponent()}
        </div>
      ),
    },
    {
      title: TabTitles.Other,
      icon: <More />,
      children: otherOptionsComponent(),
    },
    {
      title: TabTitles.UnderConstruction,
      icon: <Toolbox />,
      children: underConstructionComponent(),
    },
  ];

  return (
    <Card>
      <Card.Header
        title="BumbleBee"
        subtitle={`Bookings develop helper \nSite ID: ${siteDetails.siteID} \nMeta Site ID: ${siteDetails.metaSiteID}`}
      />
      <Card.Divider />
      <div style={{ overflow: 'hidden' }}>
        <Accordion
          size="small"
          transitionSpeed="fast"
          items={componentsItems.map((componentItem) => {
            return {
              ...componentItem,
              collapseLabel: 'Less',
              expandLabel: 'See More',
            };
          })}
        />
      </div>
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
