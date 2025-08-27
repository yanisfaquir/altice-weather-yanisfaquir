export enum TemperatureUnit {
  CELSIUS = 'celsius',
  FAHRENHEIT = 'fahrenheit'
}

export enum AltitudeUnit {
  METERS = 'meters',
  FEET = 'feet'
}

// Network power scale from 1 to 5
export type NetworkPower = 1 | 2 | 3 | 4 | 5;

// Labels for network power for UI display
export const NetworkPowerLabels: Record<NetworkPower, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Fair', 
  4: 'Good',
  5: 'Excellent'
} as const;