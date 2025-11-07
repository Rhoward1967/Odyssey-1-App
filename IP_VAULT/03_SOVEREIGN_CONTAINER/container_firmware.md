# Sovereign Container: Firmware & Logic Blueprint

**The Physical Nervous System**

This firmware executes HiveOrchestrator commands and manages the vessel's physical homeostasis.

## System Constants (Calibration Values)

```javascript
// Atmospheric Thresholds (Risk 1: Condensation)
const MAX_RECOMMENDED_HUMIDITY = 10.0;  // % RH
const MAX_SAFE_PRESSURE = 1.2;          // ATM
const MIN_SAFE_PRESSURE = 0.9;          // ATM

// Thermal-Fluidic Thresholds (Risk 3: Pump Failure)
const MIN_FLOW_RATE = 1.0;              // GPM
const CRITICAL_CPU_TEMP = 90.0;         // °C
const TARGET_CPU_TEMP = 70.0;           // °C

// Power Grid Thresholds (Risk 2: Power Mixing)
const MAX_PSU_DRAW_FOR_TEC = 150.0;     // Watts
```

## Main Control Loop

**Runs 10 times per second**

```javascript
function main_loop() {
    // 1. "Senses": Read all physical sensors
    sensors = readAllSensors();

    // 2. "Immune System": Check for critical failures first
    runFailSafeLogic(sensors);

    // 3. "Lungs": Check atmosphere & condensation risk
    runAtmosphericLogic(sensors);

    // 4. "Heart": Manage power & thermal regulation
    runRegenerativePowerLogic(sensors);

    // 5. "Nervous System": Report status back to Hive
    sendSensorReportToHive(sensors);
}
```

## Control Algorithms

### A. Atmospheric Logic (Risk 1 Mitigation)

**Prevents condensation by disabling chillers on seal breach**

```javascript
function runAtmosphericLogic(sensors) {
    if (sensors.humidity > MAX_RECOMMENDED_HUMIDITY) {
        // CRITICAL: Seal breach detected
        setTEC_Power(0);                    // Disable chillers
        setDesiccantSystem(true);           // Activate moisture removal
        sendAlertToHive("CRITICAL: Seal Breach! Humidity > 10%");
    } 
    else if (sensors.pressure < MIN_SAFE_PRESSURE) {
        // Secondary detection: Pressure drop
        setTEC_Power(0);
        setDesiccantSystem(true);
        sendAlertToHive("CRITICAL: Seal Breach! Low pressure detected");
    } 
    else {
        // Atmosphere nominal
        setDesiccantSystem(false);
    }
}
```

### B. Regenerative Power Logic (Risk 2 Mitigation)

**The Hybrid Power Formula: TEG-first, PSU top-up**

```javascript
function runRegenerativePowerLogic(sensors) {
    // Only run if chillers are enabled
    if (!isTEC_Enabled()) return;

    // 1. Get "free" recycled power from waste heat
    recycledPower_W = sensors.tegPowerOut;

    // 2. Calculate required power for target temp (PID control)
    requiredPower_W = calculatePowerForTargetTemp(
        sensors.cpuTemp,
        TARGET_CPU_TEMP
    );

    // 3. Calculate deficit
    deficitPower_W = requiredPower_W - recycledPower_W;

    // 4. Execute hybrid power mixing
    if (deficitPower_W <= 0) {
        // Case 1: More recycled power than needed
        setTEC_Power(requiredPower_W, "TEG_ONLY");
        setPSU_Draw(0);
    } else {
        // Case 2: Need PSU top-up
        if (deficitPower_W > MAX_PSU_DRAW_FOR_TEC) {
            deficitPower_W = MAX_PSU_DRAW_FOR_TEC;
        }
        setTEC_Power(recycledPower_W, "TEG_ONLY");
        setTEC_Power(deficitPower_W, "PSU_DRAW");
    }
}
```

### C. Fail-Safe Logic (Risk 3 Mitigation)

**Graceful degradation on pump failure**

```javascript
function runFailSafeLogic(sensors) {
    if (sensors.flowRate < MIN_FLOW_RATE) {
        // CRITICAL: "Heart attack" - pump failure
        sendAlertToHive("CRITICAL: Flow rate < 1.0 GPM!");
        
        setTEC_Power(0);                          // Disable chillers
        setPumpSpeed("PRIMARY_PUMP", 0);          // Stop failed pump
        setPumpSpeed("BACKUP_PUMP", 100);         // Activate backup

        // Check again on next loop
        if (readSensor("FLOW_RATE_SENSOR") < MIN_FLOW_RATE) {
            // Both pumps failed - switch to air cooling
            setBackupFans(100);
            sendAlertToHive("CRITICAL: Backup pump failed! Air cooling activated");
        }
    } 
    else if (sensors.cpuTemp > CRITICAL_CPU_TEMP) {
        // Secondary fail-safe: CPU overheat
        sendAlertToHive("CRITICAL: CPU > 90°C! Emergency shutdown imminent");
        setBackupFans(100);
        setTEC_Power(0);
        // Hive would trigger graceful OS shutdown
    }
}
```

## Constitutional Hardware

All firmware logic is subservient to "The Book" (The 9 Principles):

- **Principle 1 (Self-Preservation):** Fail-safe logic prevents hardware damage
- **Principle 3 (Redundancy):** Backup pump, backup fans, degradation path
- **Principle 9 (Resource Efficiency):** TEG recycling, hybrid power mixing

**Result:** Hardware that governs itself by the same principles as the AI Mind.

---

**Status:** Design Complete  
**Next Phase:** Microcontroller selection and firmware implementation  
**Platform:** Arduino/ESP32/Raspberry Pi Pico (TBD based on I/O requirements)
