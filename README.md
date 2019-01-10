Ionic:
![ionic](https://i.imgur.com/Ys9Eu1p.png "ionic") 
Versa:
![versa](https://i.imgur.com/psYb768.png "versa")

# Marclock-with-CGM-weather
Fitbit Clock Face for Versa and Ionic

**If you do not know how to load from the developer menu, please look for this app in the fitbit clock face gallery as "Marclock CGM & Weather". Or click on this link from your phone: [Marclock CGM & Weather](https://gam.fitbit.com/gallery/clock/9eacf714-5b23-40c8-9621-ded74bd9edf9)**

# Instructions

- You must have your blood sugars accessible through a URL. (Examples include [xDrip+](https://github.com/jamorham/xDrip-plus), [Nightscout](http://www.nightscout.info/wiki/welcome/set-up-nightscout-using-heroku), [Spike](https://spike-app.com/) )
  - If you are using **xDrip** 
    - Navigate to `Settings` -> `Inter-App settings` -> `xDrip Web Service` -> `ON` 
  - If you are using **Spike**  
    - Activate internal server in `Settings` -> `integration` -> `internal HTTP server` -> `ON` click back to confirm the changes.
  - If you are using **NightScout** you can follow these instructions: http://www.nightscout.info/wiki/welcome/set-up-nightscout-using-heroku. 
    - You will then have a URL address that looks like **https://YOURADDRESS.herokuapp.com**

- Starting on your phone, navigate to the [latest version of Marclock](https://gam.fitbit.com/gallery/clock/9eacf714-5b23-40c8-9621-ded74bd9edf9) and click the **Select** button. Then click **install**. 
- After the installation has finished open the **Fitbit** app and navigate to **clock faces** then click the **green gear** to access **Marclock's settings**.
- Once in settings:  
  - Select your Data Source: either **xDrip** ,  **spike** , or **nightscout**
    - If you are using **nightscout** - you **must** enter your nightscout address. The address you enter should be something like **https://YOURADDRESS.herokuapp.com** , where 'YOURADDRESS' is replace with your personal site address. **DO NOT include anything after '.com' **
   - Select whether you would like to manually set the BG settings or have the watchface use the setting from xdrip/spike/nightscout
   - Select whether you would like to have the watch not provide alerts if you are not wearing the watch.
   - Select how many minutes you would like to have the watch snooze an alert, when you select snooze for an alert. Note that **Snooze** is for how many minuites you set, while **Mute** is for 4 hours.
   - Select whether you would like to have the watchface turn off any current Snooze or Mute timers if your BG goes back in range.
   - Select whether you would like to disable all alerts (except very low)
   - Select your desired weather unit
   - **OPTIONAL** Input your own openweather API key
    
# Features
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
- Time since last pull from Xdrip (Xdrip only pushes data once every 5 mins)
- Insulin-on-board and Carbs-on-board
- Pop up full size BG graphs

-Note that when current BG reading is low, Current BG will turn red, arc will turn red, and graph point will turn red. 
-When current BG reading is high, Current BG will turn orange, arc will turn orange, and graph point will turn orange. 
-When there is a missed BG reading, Current BG will have a gray strike-through, arc will turn gray, and graph point will turn gray and be placed in the middle of the graph. 
-A current BG of question marks means a connection with your phone (companion) has not been established, try tapping on the screen to refetch the data from Xdrip.

You can also bring up a large graph AT ANY TIME by clicking on the screen (may take a second or two to come up due to fetching more BG data points).

BG readings are fetched around every 2 minutes. 

Units/thresholds are taken from source (e.g., from xdrip) or as inputted manually in the settings.

'Disable alert' should disable all alerts except very low.

There is now an option to only alert if the watch is detected as being worn. This will prevent the watch from losing all its batteries for an alert when it is not being worn and a person is not there to snooze the alarm.

On alerts, 'Mute' is for 4 HOURS, 'Snooze' is for as many minutes as set in the settings (default 15 minutes). 
Snooze and mute should ALSO snooze alert on xdrip/spike.

-An |S| indicates a snooze is ongoing; a |M| indicates a mute is ongoing; a |D| indicates that alerts have been disabled.

-In the settings you can select whether you would like the snooze and mute to clear when BG is back in range.

**DO NOT USE FOR ANY MEDICAL/TREATMENT PURPOSES!**

This is made and based on the awesome fitbit clockfaces published by **PedanticAvenger (FlashCGM)** and **Rytiggy (Glance)**. As an amateur coder, these repositories were immensly helpful.


  

Twitter: @cramis123
