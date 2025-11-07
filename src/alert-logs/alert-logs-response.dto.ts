export enum AlertType {
  TEMP_HIGH = 'TEMP_HIGH',
  TEMP_LOW = 'TEMP_LOW',
  HUM_HIGH = 'HUM_HIGH',
  HUM_LOW = 'HUM_LOW',
}

export class RfidTagInfoDto {
  rfid_tag_id: number;
  uid: string;
  location_name: string;
  reference_temperature?: number;
  reference_humidity?: number;
}

export class WorkPlanInfoDto {
  work_plan_id: number;
  description?: string;
  status: string;
  temp_threshold: number;
  hum_threshold: number;
  violation_count: number;
  created_at?: string;
}

export class AlertDetailDto {
  alert_id: number;
  alert_type: AlertType;
  measured_value: number;
  reference_value: number;
  threshold: number;
  message: string;
  measurement_number?: number;
  created_at: string;
}

export class AlertLogResponseDto {
  work_plan: WorkPlanInfoDto;
  rfid_tag: RfidTagInfoDto;
  alerts: AlertDetailDto[];
}

// alert-logs-response.dto.ts
export class AlertLogTreeDto {
  work_plan: WorkPlanInfoDto;
  rfid_tags: {
    rfid_tag: RfidTagInfoDto;
    alerts: AlertDetailDto[];
  }[];
}