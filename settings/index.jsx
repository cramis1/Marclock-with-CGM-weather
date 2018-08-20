function mySettings(props) {
  return (
    <Page>
      <Section>
        {<Text bold align="center">Data Source Settings</Text>}
        
        <TextInput
          defaultValue="http://127.0.0.1:17580/status.json"
          settingsKey="settingsSourceURL"
          label="Click to Enter Settings API URL"
        />
        <Text>
          Default is <Link source="http://127.0.0.1:17580/status.json">http://127.0.0.1:17580/status.json</Link>
          </Text>
        <TextInput
          settingsKey="dataSourceURL"
          label="Click to Enter Data API URL"
          defaultValue="http://127.0.0.1:17580/sgv.json"
        />
        <Text>
          Default is <Link source="http://127.0.0.1:17580/sgv.json?count=12">http://127.0.0.1:17580/sgv.json</Link>
          </Text>
      </Section>
      <Toggle
            settingsKey="disableAlert"
            label="Disable Alerts"
          />
    </Page> 
  );
}

registerSettingsPage(mySettings);