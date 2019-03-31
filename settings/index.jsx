 function mySettings(props) {
  return (
    <Page>
      <Section title={<Text bold align="center"> Data Source</Text>}> 
        
        
        <Select 
          settingsKey="SourceSelect"
            label={<Text bold>Click to select Data Source</Text>}
            options={[
             {name:'xdrip'},
             {name:'spike'},
             {name:'nightscout'}
             ]}
          /> 
        
      </Section>
      <Section>
        <Text align="center"> <Text italic>Only </Text>if using Nightscout:</Text>

         <TextInput
          settingsKey="NightSourceURL"
          label="Enter Nightscout address   (ex. https://YOURADDRESS.herokuapp.com)   - do not include anything after '.com' "
          defaultValue="http://127.0.0.1:17580/"
          
        />
      
        
       </Section>
        
        
       <Section title={<Text bold align="center"> BG Settings</Text>}> 
       
        <Toggle
          settingsKey="viewSettingSelect"
          label="Manually Set BG Settings?"
          defaultValue="false"
        />  
        
            
        <TextInput
          label="High threshold"
          settingsKey="highThresholdIn"
          disabled={!(props.settingsStorage.getItem('viewSettingSelect') === "true")}
        />
        <TextInput
        label="Low threshold"
        settingsKey="lowThresholdIn"
          disabled={!(props.settingsStorage.getItem('viewSettingSelect') === "true")}
        />
        <Select
          disabled={!(props.settingsStorage.getItem('viewSettingSelect') === "true")}  
          settingsKey="BGUnitSelect"
            label="MMOL or MG/DL?"
            options={[
             {name:"mmol"},
             {name:"mgdl"}
             ]}
          /> 
      </Section>
      
      <Section title={<Text bold align="center">Alert Settings</Text>}>
        
        <Text>
          Turn off alerts if watch is not being worn:
          </Text>
        <Toggle
            settingsKey="presenceAlert"
            label=" "
          />
{/* 
        <Text>
          Raise alert if watch does not receive data for 30 minutes:
          </Text>
        <Toggle
            settingsKey="signalAlert"
            label=" "
          />
      */}
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
      
       <Section title={<Text bold align="center">Snooze Settings</Text>}>
                     
      <Text>
          Turn off snooze and mute when BG is back in range:
          </Text>
         <Toggle
            settingsKey="snoozeRemove"
            label=" "
          />
         
             
        </Section>
      
      
      
      
      <Section title={<Text bold align="center">Disable Alert</Text>}>
    
           <Text>
          Disable Alerts (except very low):
          </Text>  
      <Toggle
            settingsKey="disableAlert"
            label=" "

          />
        </Section>
       <Section title={<Text bold align="center">Weather Unit</Text>}>
       
             
      <Toggle
            settingsKey="selection"
            label="Celsius <--> Fahrenheit"
            />
        </Section>
      
      <Section title={<Text bold align="center">Weather API Key</Text>}>
        
        
         <TextInput
          label="OpenWeather API Key (Optional)"
           settingsKey="openKey"
        />
      </Section>
    </Page>  
  );
}

registerSettingsPage(mySettings);