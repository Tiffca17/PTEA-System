# Production Tracking and Equipment Automation System

An Industrial IoT system built to enhance production tracking, equipment monitoring, and process automation at a limestone mining facility in Jamaica. The system integrates multiple devices to collect real-time data, enable responsive control logic, and centralize data visualization and storage.

---

## 🔧 System Components

### 1. **Crusher Monitoring and Control System (CMCS)**
- Detects crusher status (running or stopped)
- Automatically stops the feeder if the crusher halts
- Sends real-time updates to the Central Monitoring System

### 2. **Screen Monitoring and Control System (SMCS)**
- Monitors screen activity
- Stops feeder and conveyors if the screen fails
- Reports data to the Central Monitoring System

### 3. **Belt Scale Monitoring System (BSMS)**
- Collects weight and flow rate data from the belt scale over RS-485
- Sends production metrics to the Central Monitoring System

### 4. **Central Monitoring System (CMS)**
- Receives data from all devices via Zigbee 
- Displays data on a website dashboard
- Sends alerts (email, siren) when equipment fails
- Logs data to a PostgreSQL database for historical analysis

---

## Website URL
https://p-tea.com/index.html


