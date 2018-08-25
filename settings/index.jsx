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
      <Section>
         {<Text bold align="center">Alert Settings</Text>}
      <Text>
          Alert Snooze time - {props.settingsStorage.getItem('blah')} MINUTES
          </Text>
        <Slider
          settingsKey="snoozeLength"
          min="1"
          max="90"
          step="1"
          defaultValue="15"
          onChange={value => props.settingsStorage.setItem('blah', value)} 
      />
         <Text> Default is 15 minutes</Text>
     </Section>
      <Section>
        <Text>
          Disable Alerts (except very low)
          </Text>
             
      <Toggle
            settingsKey="disableAlert"
            label="Disable Alerts"

          />
        </Section>
       <Section>
        <Text>
          Weather Unit
         </Text>
             
      <Select
            settingsKey="selection"
            label="Select"
            options={[
             {name:"celsius"},
             {name:"fahrenheit"}
             ]}
          />
        </Section>
    </Page>  
  );
}

registerSettingsPage(mySettings);