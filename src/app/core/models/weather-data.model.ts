import {TemperatureUnit, NetworkPower, AltitudeUnit} from './weather.enums'
export interface WeatherData {
  id?: string;
  city: string;
  temperature: number;
  temperatureUnit: TemperatureUnit;
  isRaining: boolean;
  date: Date;
  networkPower: NetworkPower; // 1-5 scale
  altitude: number;
  altitudeUnit: AltitudeUnit;
  createdAt?: Date;
  updatedAt?: Date;
}

