![ionic](https://i.imgur.com/Ys9Eu1p.png "ionic") 
![versa](https://i.imgur.com/psYb768.png "versa")

# Marclock-with-CGM-weather
Fitbit Clock Face for Versa and Ionic

If you do not know how to load from the developer menu, please look for this app in the fitbit clock face gallery as "Marclock with CGM & weather".

This clock face supports Blood Glucose (CGM - continuous glucose monitoring) data from XDrip+, Spike, or Nightscout. 

Includes: 

- Weather
- Heart-rate
- Steps
- Active minutes
- Battery charge level (as text (percentage) and as the size of the arc
- Graph of recent glucose readings
- Current BG reading
- Current delta
- Trend arrow
- Time since last pull

Note that when current BG reading is low, Current BG will turn red and graph point will turn red. When current BG reading is high, Current BG will turn orange and graph point will turn orange. When there is a missed BG reading, Current BG will have a gray strike-through and graph point will turn gray. A current BG of question marks means a connection with your phone (companion) has not been established.

You can re-fetch BG and weather AT ANY TIME by clicking on the screen.

Units/thresholds are taken from source (e.g., from xdrip).

'Disable alert' will disable all alerts except very low BG.

DO NOT USE FOR ANY MEDICAL/TREATMENT PURPOSES!

This is made and based on the awesome fitbit clockfaces published by PedanticAvenger (FlashCGM) and Rytiggy (Glance). As an amateur coder, these repositories were immensly helpful.

# Instructions
- You must have your blood sugars accessible through a URL. (Examples include [xDrip+](https://github.com/jamorham/xDrip-plus), [Nightscout](http://www.nightscout.info/wiki/welcome/set-up-nightscout-using-heroku), [Spike](https://spike-app.com/) )
- Starting on your phone, navigate to the [latest version of Marclock](https://gam.fitbit.com/gallery/clock/9eacf714-5b23-40c8-9621-ded74bd9edf9) and click the **Select** button. Then click **install**. 
- After the installation has finished open the **Fitbit** app and navigate to **clock faces** then click the **green gear** to access **Marclock's settings**.
- Once in settings, enter the dataURL API endpoint, the settingsURL API endpoint, and whether you would like to disable alerts. Note that by default, the dataURL endpoint will be the local webservice of http://127.0.0.1:17580/sgv.json and the settingsURL endpoint will be the local webservice of http://127.0.0.1:17580/status.json
- After starting the webservice in xDrip+/Spike, or after entering the above endpoints, you should be able to see the blood sugars on the watch! 

- What is an API endpoint?
  - An API endpoint is a unique URL that represents your data.
- How do I use it with the watch? 
  - If you are using **xDrip** 
    - Navigate to `Settings` -> `Inter-App settings` -> `xDrip Web Service` -> `ON` 
    - Point the watch face to the following URL (API Endpoint): `http://127.0.0.1:17580/sgv.json`
  - If you are using **NightScout** you can follow [these steps](http://www.nightscout.info/wiki/welcome/set-up-nightscout-using-heroku) and then find the JSON endpoints [here](https://github.com/nightscout/cgm-remote-monitor/wiki/API-v1.0.0-beta-Endpoints) - replace "cgmtest" with your personal URL.
  - If you are using **Spike**  
    - Activate internal server in `Settings` -> `integration` -> `internal HTTP server` -> `ON` click back to confirm the changes.
    - Point the watch face to the following URL (API Endpoint): `http://127.0.0.1:1979/sgv.json`

