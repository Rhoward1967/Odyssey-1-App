# Sovereign Container: Hardware Specifications

**© 2025 Rickey A Howard. All Rights Reserved.**  
**Property of Rickey A Howard**

> This hardware design and all associated component specifications are proprietary intellectual property.
> Unauthorized copying, distribution, modification, or use is strictly prohibited without express
> written permission from Rickey A Howard.

---

## 🛡️ Patent Notice

**This document describes patentable innovations including:**
- Regenerative thermoelectric power systems
- Hermetically sealed computational environments
- Constitutional hardware component selection
- Graceful degradation cooling architectures

**All component selections, specifications, and integration designs are protected intellectual property.**

---

## Component Selection Guide

### System A: Atmospheric Integrity ("The Lungs")

#### 1. Hermetically Sealed Chassis
**Purpose:** Prevents external humidity from entering the cooling environment

**Specifications:**
- **Material:** Aluminum 6061-T6 or steel
- **Sealing:** EPDM rubber gaskets (rated for -40°C to +120°C)
- **Pressure Rating:** ±0.3 ATM differential
- **Leak Rate:** < 0.1 mbar·L/s (tested per ASTM E498)

**Recommended Vendors:**
- Custom fabrication via CNC machining
- Modified server chassis (e.g., Rosewill RSV-L4500)

#### 2. Humidity Sensor
**Purpose:** Detects seal breaches via internal humidity monitoring

**Specifications:**
- **Type:** Capacitive humidity sensor
- **Range:** 0-100% RH
- **Accuracy:** ±2% RH
- **Response Time:** < 8 seconds
- **Interface:** I2C or analog voltage (0-5V)

**Recommended Models:**
- DHT22/AM2302 (budget option)
- Sensirion SHT31 (high precision)
- Honeywell HIH6130 (industrial grade)

#### 3. Pressure Sensor
**Purpose:** Secondary seal breach detection via pressure monitoring

**Specifications:**
- **Type:** Piezoresistive absolute pressure sensor
- **Range:** 0.5-1.5 ATM (50-150 kPa)
- **Accuracy:** ±0.25% full scale
- **Interface:** I2C or analog (0-5V)

**Recommended Models:**
- BMP280 (budget option)
- MS5611 (high accuracy)
- Honeywell SSCDANN030PAAA5 (industrial)

#### 4. Desiccant System
**Purpose:** Active moisture removal on seal breach detection

**Specifications:**
- **Desiccant Type:** Silica gel or molecular sieve
- **Capacity:** 500g minimum
- **Regeneration:** Electric heating element (50-100W)
- **Airflow:** 10-20 CFM fan

**Implementation:**
- Sealed desiccant cartridge
- PWM-controlled heating element
- Automated regeneration cycle (firmware-controlled)

---

### System B: Regenerative Power ("The Heart")

#### 1. Thermoelectric Generator (TEG)
**Purpose:** Harvests waste heat from CPU/GPU, converts to electricity

**Specifications:**
- **Type:** Bismuth telluride (Bi2Te3) TEG modules
- **Hot Side Temp:** 80-100°C (operating range)
- **Cold Side Temp:** 30-40°C (liquid-cooled)
- **Power Output:** 15-50W per module (ΔT dependent)
- **Efficiency:** 5-8% (Carnot limited)
- **Form Factor:** 40x40mm or 50x50mm

**Recommended Models:**
- TEG1-12610-8.0 (Marlow Industries)
- TEC1-12706 (in reverse operation mode)
- Custom-spec from TEGPro or TEC Microsystems

**Configuration:**
- 2-4 modules in series-parallel
- Total target output: 30-80W @ ΔT=50°C
- Direct mounting to CPU/GPU cold plate

#### 2. Thermoelectric Cooler (TEC)
**Purpose:** Active cooling (chiller) powered by hybrid TEG/PSU grid

**Specifications:**
- **Type:** Peltier module (same Bi2Te3 technology)
- **Cooling Power:** 60-150W @ ΔT=40°C
- **Max Current:** 6-12A @ 12-15V DC
- **Form Factor:** 40x40mm or 62x62mm
- **Coefficient of Performance (COP):** 0.5-1.2 (decreases with ΔT)

**Recommended Models:**
- TEC1-12706 (budget, 60W cooling)
- TEC1-12715 (high power, 150W cooling)
- Custom stacked modules for >200W

**Configuration:**
- 1-2 modules (single-stage or cascade)
- PWM control (0-100% duty cycle)
- Mounted between CPU cold plate and liquid loop

#### 3. Liquid Cooling Loop
**Purpose:** Transfers heat from CPU → TEG → TEC → Radiator

**Specifications:**
- **Fluid:** Distilled water + biocide (Mayhems Biocide Extreme)
- **Flow Rate:** 1.0-2.0 GPM (target)
- **Tubing:** 10mm ID / 13mm OD soft tubing (clear PVC or EPDM)
- **Fittings:** G1/4" compression fittings (brass or aluminum)

**Components:**
- CPU Water Block (EK-Velocity, Corsair XC7, or equivalent)
- Radiator: 240mm or 360mm (Alphacool, Hardware Labs)
- Reservoir: 250-500mL (integrated with pump)

#### 4. Pumps (Primary + Backup)
**Purpose:** Circulates coolant through the loop

**Specifications:**
- **Type:** DC brushless motor centrifugal pump
- **Flow Rate:** 1.0-2.5 GPM (adjustable via PWM)
- **Head Pressure:** 2-3 meters @ 1.5 GPM
- **Power:** 12V DC, 3-7W
- **Noise:** < 30 dB(A)

**Recommended Models:**
- Laing D5 (DDC variant, high reliability)
- Alphacool VPP755 (PWM controlled)
- XSPC D5 Photon (reservoir combo)

**Configuration:**
- Primary pump: Runs 24/7 at 70-100% duty
- Backup pump: Activates on primary failure (firmware-controlled)

#### 5. Flow Rate Sensor
**Purpose:** "Heart attack" detection (pump failure monitoring)

**Specifications:**
- **Type:** Hall effect turbine flow meter
- **Range:** 0.5-3.0 GPM
- **Accuracy:** ±2% of reading
- **Interface:** Pulse output (frequency proportional to flow)

**Recommended Models:**
- Barrowch FBFT03 (budget)
- Aqua Computer High Flow NEXT (display + logging)
- Digmesa FHKSC (industrial grade)

#### 6. Temperature Sensors
**Purpose:** Monitor loop temperatures (in/out), CPU temp

**Specifications:**
- **Type:** Thermistor or RTD (Resistance Temperature Detector)
- **Range:** 0-100°C
- **Accuracy:** ±0.5°C
- **Interface:** Analog (10kΩ NTC) or 1-Wire (DS18B20)

**Recommended Models:**
- DS18B20 (digital, 1-Wire, ±0.5°C)
- 10kΩ NTC thermistor (analog, cheap)
- PT1000 RTD (high precision, ±0.1°C)

**Placement:**
- Liquid In (pre-CPU)
- Liquid Out (post-CPU, pre-TEG)
- CPU Die (motherboard sensor or direct thermistor)

#### 7. Hybrid Power Controller
**Purpose:** Manages TEG/PSU power mixing via firmware commands

**Specifications:**
- **TEG Input:** 12-48V DC (buck converter to 12V)
- **PSU Input:** 12V DC (ATX PSU rail)
- **TEC Output:** 12V DC PWM (0-100% duty cycle)
- **Control:** I2C/SPI commands from microcontroller

**Implementation Options:**

**Option A: Custom PCB**
- Buck converter IC (LM2596, XL4015)
- MOSFET power switching (IRFZ44N, AOD4184)
- Current sensing (ACS712, INA219)
- Arduino/ESP32 controlled

**Option B: Off-the-shelf modules**
- MPPT solar charge controller (repurposed for TEG)
- DC-DC buck converters (Drok, RioRand)
- Relay-based switching (for simplicity)

---

### System C: Graceful Degradation ("The Fail-Safe")

#### 1. Backup Fans
**Purpose:** Emergency air cooling on total pump failure

**Specifications:**
- **Size:** 120mm or 140mm
- **Airflow:** 50-80 CFM @ 1500 RPM
- **Static Pressure:** 1.5-3.0 mm H2O
- **Noise:** < 25 dB(A) @ 50% duty
- **Interface:** 4-pin PWM

**Recommended Models:**
- Noctua NF-A12x25 (quiet, high performance)
- Arctic P12 PWM PST (budget)
- be quiet! Silent Wings 3 (premium)

**Configuration:**
- 2-3 fans (intake + exhaust)
- Normally off (0% duty)
- Activated on pump failure (100% duty, firmware-controlled)

---

### Control System: The Nervous System

#### Microcontroller
**Purpose:** Executes firmware logic, interfaces with Hive

**Specifications:**
- **Processor:** ARM Cortex-M or ESP32
- **Analog Inputs:** 8+ (for sensors)
- **PWM Outputs:** 6+ (pumps, fans, TECs)
- **Communication:** UART/I2C/SPI for Hive connection
- **Memory:** 256KB+ Flash, 32KB+ RAM

**Recommended Platforms:**
- **Arduino Mega 2560** (54 I/O pins, easy prototyping)
- **ESP32 DevKit** (WiFi, dual-core, more powerful)
- **Raspberry Pi Pico** (RP2040, cost-effective)
- **Teensy 4.0** (fastest, most capable)

#### Power Requirements

**Total System Draw:**
