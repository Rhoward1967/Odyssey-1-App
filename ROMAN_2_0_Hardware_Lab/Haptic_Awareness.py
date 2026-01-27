"""
R.O.M.A.N. 2.0 Haptic Awareness System
=======================================

Maps the 360-degree environment into physical vibrations on the suit's weave.
Provides tactical "sixth sense" by vibrating skin before visual threat detection.

Copyright © 2026 Rickey Allan Howard / HJS Services LLC
"""

import math

class Haptic_Module:
    """
    Implements 360-degree threat mapping using UWB radar (Component 10)
    and haptic feedback grid (Component 2 vibration motors).
    """
    
    def __init__(self):
        # Sector definitions (4 primary + 4 intermediate = 8 total)
        self.sectors = [
            "FRONT",      # 0° (337.5° - 22.5°)
            "FRONT-RIGHT", # 45° (22.5° - 67.5°)
            "RIGHT",       # 90° (67.5° - 112.5°)
            "REAR-RIGHT",  # 135° (112.5° - 157.5°)
            "REAR",        # 180° (157.5° - 202.5°)
            "REAR-LEFT",   # 225° (202.5° - 247.5°)
            "LEFT",        # 270° (247.5° - 292.5°)
            "FRONT-LEFT"   # 315° (292.5° - 337.5°)
        ]
        
        # Haptic node positions (18 vibration motors on Component 2 grid)
        self.node_positions = {
            "FRONT": [(0, 10), (0, 0), (0, -10)],           # Chest center (3 nodes)
            "FRONT-RIGHT": [(5, 5), (10, 5)],                # Right chest (2 nodes)
            "RIGHT": [(15, 0), (15, -5)],                    # Right side (2 nodes)
            "REAR-RIGHT": [(10, -10)],                       # Right rear shoulder (1 node)
            "REAR": [(0, -15), (5, -15), (-5, -15)],        # Back center (3 nodes)
            "REAR-LEFT": [(-10, -10)],                       # Left rear shoulder (1 node)
            "LEFT": [(-15, 0), (-15, -5)],                   # Left side (2 nodes)
            "FRONT-LEFT": [(-5, 5), (-10, 5)]                # Left chest (2 nodes)
        }
        
        # Detection parameters
        self.detection_range_m = 15.0  # UWB radar max range (Component 10)
        self.min_threat_velocity_ms = 0.5  # Ignore stationary objects
        
    def map_threat(self, azimuth_deg, range_m=None, velocity_ms=None):
        """
        Convert radar detection to haptic feedback instruction.
        
        Parameters:
        -----------
        azimuth_deg : float
            Threat bearing in degrees (0° = front, 90° = right, 180° = rear, 270° = left)
        range_m : float, optional
            Distance to threat in meters (affects vibration intensity)
        velocity_ms : float, optional
            Threat velocity in m/s (affects vibration pattern)
            
        Returns:
        --------
        dict : Haptic feedback instructions
        """
        
        # Normalize azimuth to 0-360 range
        azimuth_normalized = azimuth_deg % 360
        
        # Determine sector (8-way division)
        sector_idx = round(azimuth_normalized / 45) % 8
        sector_name = self.sectors[sector_idx]
        
        # Calculate vibration intensity based on range (closer = stronger)
        if range_m is not None:
            range_clamped = max(0.5, min(range_m, self.detection_range_m))  # Clamp to valid range
            intensity = int(((self.detection_range_m - range_clamped) / self.detection_range_m) * 100)
        else:
            intensity = 50  # Default medium intensity if range unknown
        
        # Determine vibration pattern based on velocity
        if velocity_ms is not None:
            if velocity_ms > 10:  # High-speed threat (projectile, vehicle)
                pattern = "RAPID_PULSE"  # 10 Hz vibration
            elif velocity_ms > 2:  # Medium-speed threat (running person)
                pattern = "PULSE"        # 5 Hz vibration
            elif velocity_ms > self.min_threat_velocity_ms:  # Slow-moving threat (walking)
                pattern = "STEADY"       # Continuous vibration
            else:  # Stationary (ignore)
                pattern = "NONE"
                intensity = 0
        else:
            pattern = "PULSE"  # Default pattern if velocity unknown
        
        # Get node coordinates for this sector
        active_nodes = self.node_positions[sector_name]
        
        return {
            "Sector": sector_name,
            "Azimuth_Deg": round(azimuth_normalized, 1),
            "Active_Nodes": active_nodes,
            "Node_Count": len(active_nodes),
            "Vibration_Pattern": pattern,
            "Intensity_Percent": intensity,
            "Range_m": round(range_m, 1) if range_m else "Unknown",
            "Velocity_ms": round(velocity_ms, 1) if velocity_ms else "Unknown",
            "Message": f"Haptic Pulse: {sector_name} - Brace for Impact."
        }
    
    def calculate_bearing(self, threat_x, threat_y, wearer_x=0, wearer_y=0):
        """
        Calculate bearing to threat from wearer position.
        
        Parameters:
        -----------
        threat_x, threat_y : float
            Threat coordinates (meters)
        wearer_x, wearer_y : float
            Wearer coordinates (meters), default (0,0) = origin
            
        Returns:
        --------
        float : Bearing in degrees (0° = north/front)
        """
        
        # Calculate relative position
        delta_x = threat_x - wearer_x
        delta_y = threat_y - wearer_y
        
        # Calculate bearing using atan2 (handles all quadrants correctly)
        bearing_rad = math.atan2(delta_x, delta_y)
        bearing_deg = math.degrees(bearing_rad)
        
        # Normalize to 0-360 range
        bearing_normalized = (bearing_deg + 360) % 360
        
        return bearing_normalized
    
    def multi_threat_fusion(self, threats):
        """
        Process multiple simultaneous threats and prioritize haptic response.
        
        Parameters:
        -----------
        threats : list of dicts
            Each dict contains: {'azimuth': float, 'range': float, 'velocity': float}
            
        Returns:
        --------
        dict : Fused haptic response with prioritized threat
        """
        
        if not threats:
            return {"Status": "No Threats Detected", "Active_Nodes": []}
        
        # Calculate threat priority scores
        scored_threats = []
        for threat in threats:
            # Priority = (velocity weight × velocity) + (proximity weight × 1/range)
            velocity_score = threat.get('velocity', 0) * 10
            range_score = (self.detection_range_m / max(threat.get('range', self.detection_range_m), 0.5)) * 50
            total_score = velocity_score + range_score
            
            scored_threats.append({
                'threat': threat,
                'score': total_score
            })
        
        # Sort by priority (highest score = highest priority)
        scored_threats.sort(key=lambda x: x['score'], reverse=True)
        
        # Generate haptic response for top 3 threats
        responses = []
        for i, scored in enumerate(scored_threats[:3]):
            threat = scored['threat']
            response = self.map_threat(
                azimuth_deg=threat.get('azimuth', 0),
                range_m=threat.get('range'),
                velocity_ms=threat.get('velocity')
            )
            response['Priority'] = i + 1
            response['Threat_Score'] = round(scored['score'], 2)
            responses.append(response)
        
        return {
            "Total_Threats": len(threats),
            "Active_Responses": len(responses),
            "Highest_Priority": responses[0] if responses else None,
            "All_Responses": responses
        }


# ============================================================================
# LAB TESTING EXAMPLES
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("R.O.M.A.N. 2.0 HAPTIC AWARENESS - LAB SIMULATION")
    print("=" * 70)
    
    # Initialize the module
    radar = Haptic_Module()
    
    # Test Case 1: Threat from rear
    print("\n[TEST 1] Threat Detection: Rear Sector")
    print("-" * 70)
    result_rear = radar.map_threat(azimuth_deg=180, range_m=10.0, velocity_ms=1.5)
    for key, value in result_rear.items():
        print(f"{key:.<35} {value}")
    
    # Test Case 2: High-speed threat from right (incoming projectile)
    print("\n[TEST 2] High-Speed Projectile: Right Sector")
    print("-" * 70)
    result_projectile = radar.map_threat(azimuth_deg=90, range_m=5.0, velocity_ms=350)
    for key, value in result_projectile.items():
        print(f"{key:.<35} {value}")
    
    # Test Case 3: Calculate bearing from coordinates
    print("\n[TEST 3] Bearing Calculation from Coordinates")
    print("-" * 70)
    threat_x, threat_y = 10, 10  # Threat at (10, 10)
    bearing = radar.calculate_bearing(threat_x, threat_y)
    print(f"Threat Position: ({threat_x}, {threat_y})")
    print(f"Calculated Bearing: {bearing:.1f}°")
    result_bearing = radar.map_threat(azimuth_deg=bearing, range_m=14.1, velocity_ms=2.0)
    print(f"Sector: {result_bearing['Sector']}")
    print(f"Message: {result_bearing['Message']}")
    
    # Test Case 4: Multiple simultaneous threats
    print("\n[TEST 4] Multi-Threat Fusion (3 simultaneous threats)")
    print("-" * 70)
    threats = [
        {'azimuth': 45, 'range': 12.0, 'velocity': 1.0},   # Front-right, walking
        {'azimuth': 180, 'range': 8.0, 'velocity': 3.5},   # Rear, running
        {'azimuth': 270, 'range': 15.0, 'velocity': 0.8}   # Left, walking slow
    ]
    fusion_result = radar.multi_threat_fusion(threats)
    print(f"Total Threats Detected: {fusion_result['Total_Threats']}")
    print(f"Active Responses: {fusion_result['Active_Responses']}")
    print(f"\nHighest Priority Threat:")
    if fusion_result['Highest_Priority']:
        for key, value in fusion_result['Highest_Priority'].items():
            print(f"  {key:.<33} {value}")
    
    print("\n" + "=" * 70)
    print("CONCLUSION: 360° situational awareness achieved through haptic")
    print("feedback. Wearer gains 'sixth sense' before visual confirmation.")
    print("=" * 70)
