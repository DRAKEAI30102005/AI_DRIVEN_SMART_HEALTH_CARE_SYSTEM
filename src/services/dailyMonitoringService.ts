export type DailyMonitoringInput = {
  bloodSugar: number;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  sleepHours: number;
  exerciseMinutes: number;
  waterIntakeLiters: number;
  stressLevel: number;
  symptoms: string;
  foodNotes: string;
  medicationNotes: string;
};

export type BodyRiskZone =
  | 'head'
  | 'chest'
  | 'left-arm'
  | 'right-arm'
  | 'abdomen'
  | 'pelvis'
  | 'left-leg'
  | 'right-leg';

export type DailyMonitoringResult = {
  riskPercentage: number;
  outcome: 'Low risk' | 'Moderate risk' | 'High risk';
  summary: string;
  riskDrivers: string[];
  recommendations: string[];
  highlightedZones: BodyRiskZone[];
  alerts: Array<{
    metric: string;
    status: 'Normal' | 'Warning' | 'Critical';
    message: string;
  }>;
  metrics: {
    bloodSugarState: string;
    bloodPressureState: string;
    heartRateState: string;
    hydrationState: string;
  };
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pushZone(zones: Set<BodyRiskZone>, zone: BodyRiskZone) {
  zones.add(zone);
}

export function analyzeDailyMonitoring(input: DailyMonitoringInput): DailyMonitoringResult {
  let score = 12;
  const riskDrivers: string[] = [];
  const recommendations: string[] = [];
  const alerts: DailyMonitoringResult['alerts'] = [];
  const highlightedZones = new Set<BodyRiskZone>();

  let bloodSugarState = 'Normal';
  let bloodPressureState = 'Normal';
  let heartRateState = 'Normal';
  let hydrationState = 'Normal';

  if (input.bloodSugar >= 180) {
    score += 28;
    bloodSugarState = 'High';
    riskDrivers.push('Blood sugar is in a high range and may increase short-term metabolic risk.');
    recommendations.push('Review glucose control, meals, and medication timing with your clinician.');
    alerts.push({
      metric: 'Blood sugar',
      status: 'Critical',
      message: 'Glucose is above 180 mg/dL. Consider prompt review and follow your clinician guidance.',
    });
    pushZone(highlightedZones, 'abdomen');
    pushZone(highlightedZones, 'pelvis');
  } else if (input.bloodSugar >= 140) {
    score += 16;
    bloodSugarState = 'Elevated';
    riskDrivers.push('Blood sugar is above the ideal range for daily monitoring.');
    recommendations.push('Limit high-sugar meals today and continue monitoring glucose closely.');
    alerts.push({
      metric: 'Blood sugar',
      status: 'Warning',
      message: 'Glucose is elevated above the preferred daily range.',
    });
    pushZone(highlightedZones, 'abdomen');
  } else if (input.bloodSugar < 70) {
    score += 22;
    bloodSugarState = 'Low';
    riskDrivers.push('Blood sugar appears low and may suggest hypoglycemia risk.');
    recommendations.push('Use your provider-approved low-sugar response plan if symptoms appear.');
    alerts.push({
      metric: 'Blood sugar',
      status: 'Critical',
      message: 'Glucose is below 70 mg/dL and may indicate hypoglycemia risk.',
    });
    pushZone(highlightedZones, 'head');
    pushZone(highlightedZones, 'abdomen');
  }

  if (input.systolicBp >= 140 || input.diastolicBp >= 90) {
    score += 20;
    bloodPressureState = 'High';
    riskDrivers.push('Blood pressure is elevated and may increase cardiovascular strain.');
    recommendations.push('Reduce stress triggers and monitor blood pressure again after rest.');
    alerts.push({
      metric: 'Blood pressure',
      status: 'Critical',
      message: 'Blood pressure is in a high-risk range and should be reviewed quickly.',
    });
    pushZone(highlightedZones, 'chest');
    pushZone(highlightedZones, 'head');
  } else if (input.systolicBp >= 130 || input.diastolicBp >= 85) {
    score += 10;
    bloodPressureState = 'Borderline';
    riskDrivers.push('Blood pressure is slightly elevated compared with healthy targets.');
    alerts.push({
      metric: 'Blood pressure',
      status: 'Warning',
      message: 'Blood pressure is above target and should be monitored again.',
    });
    pushZone(highlightedZones, 'chest');
  }

  if (input.heartRate >= 105) {
    score += 10;
    heartRateState = 'Fast';
    riskDrivers.push('Heart rate is elevated and could reflect stress, dehydration, or illness.');
    alerts.push({
      metric: 'Heart rate',
      status: 'Warning',
      message: 'Heart rate is elevated above 105 bpm.',
    });
    pushZone(highlightedZones, 'chest');
  } else if (input.heartRate <= 50) {
    score += 12;
    heartRateState = 'Low';
    riskDrivers.push('Heart rate is unusually low and should be monitored with symptoms.');
    alerts.push({
      metric: 'Heart rate',
      status: 'Warning',
      message: 'Heart rate is lower than expected and should be monitored with symptoms.',
    });
    pushZone(highlightedZones, 'chest');
  }

  if (input.sleepHours < 5) {
    score += 14;
    riskDrivers.push('Very low sleep can worsen blood sugar, recovery, and blood pressure.');
    recommendations.push('Aim for recovery sleep tonight and reduce demanding activity if possible.');
    pushZone(highlightedZones, 'head');
  } else if (input.sleepHours < 7) {
    score += 7;
    riskDrivers.push('Sleep is below the ideal recovery range.');
  }

  if (input.exerciseMinutes < 15) {
    score += 8;
    riskDrivers.push('Low daily movement may reduce glucose stability and recovery.');
    pushZone(highlightedZones, 'left-leg');
    pushZone(highlightedZones, 'right-leg');
  } else if (input.exerciseMinutes >= 45) {
    score -= 4;
  }

  if (input.waterIntakeLiters < 1.5) {
    score += 8;
    hydrationState = 'Low';
    riskDrivers.push('Hydration appears low, which can affect fatigue and glucose control.');
    recommendations.push('Increase water intake gradually unless your care plan limits fluids.');
    alerts.push({
      metric: 'Hydration',
      status: 'Warning',
      message: 'Water intake is low and may contribute to fatigue or unstable vitals.',
    });
    pushZone(highlightedZones, 'head');
    pushZone(highlightedZones, 'left-arm');
    pushZone(highlightedZones, 'right-arm');
  }

  if (input.stressLevel >= 8) {
    score += 14;
    riskDrivers.push('High stress may increase cardiovascular and glucose variability.');
    recommendations.push('Use a stress-reduction routine and keep today lighter if possible.');
    alerts.push({
      metric: 'Stress',
      status: 'Warning',
      message: 'Stress is very high today and may worsen other health indicators.',
    });
    pushZone(highlightedZones, 'head');
    pushZone(highlightedZones, 'chest');
  } else if (input.stressLevel >= 5) {
    score += 7;
  }

  const symptomText = input.symptoms.toLowerCase();
  const foodText = input.foodNotes.toLowerCase();

  if (symptomText.match(/dizzy|blurred|headache/)) {
    score += 8;
    pushZone(highlightedZones, 'head');
  }

  if (symptomText.match(/chest|breath|palpitation/)) {
    score += 12;
    pushZone(highlightedZones, 'chest');
  }

  if (symptomText.match(/numb|arm|shoulder|hand/)) {
    score += 9;
    pushZone(highlightedZones, 'left-arm');
    pushZone(highlightedZones, 'right-arm');
  }

  if (symptomText.match(/stomach|abdomen|gut|cramp|nausea/)) {
    score += 10;
    pushZone(highlightedZones, 'abdomen');
  }

  if (symptomText.match(/hip|pelvis|lower back/)) {
    score += 10;
    pushZone(highlightedZones, 'pelvis');
  }

  if (symptomText.match(/leg|knee|foot|walking|weak/)) {
    score += 10;
    pushZone(highlightedZones, 'left-leg');
    pushZone(highlightedZones, 'right-leg');
  }

  if (symptomText.match(/dizzy|blurred|fatigue|chest|breath|numb|pain|weak/)) {
    score += 8;
    riskDrivers.push('Reported symptoms suggest your daily status should be reviewed carefully.');
    recommendations.push('If symptoms worsen or feel urgent, seek medical help promptly.');
  }

  if (foodText.match(/dessert|soda|sweet|fried|skip meal|fast food/)) {
    score += 6;
    riskDrivers.push('Meal notes suggest possible blood sugar or blood pressure triggers today.');
    pushZone(highlightedZones, 'abdomen');
  }

  if (!input.medicationNotes.trim()) {
    recommendations.push('Record medication use daily so trends are easier to interpret over time.');
  }

  if (recommendations.length === 0) {
    recommendations.push("Continue today's routine and log your next reading to track trends.");
  }

  if (riskDrivers.length === 0) {
    riskDrivers.push('Your daily inputs are generally stable with no major immediate warning patterns.');
  }

  if (highlightedZones.size === 0) {
    pushZone(highlightedZones, 'chest');
    pushZone(highlightedZones, 'abdomen');
  }

  if (alerts.length === 0) {
    alerts.push({
      metric: 'Overall daily status',
      status: 'Normal',
      message: 'No major threshold breaches were detected from today’s entries.',
    });
  }

  const riskPercentage = clamp(Math.round(score), 5, 95);

  let outcome: DailyMonitoringResult['outcome'] = 'Low risk';
  if (riskPercentage >= 65) {
    outcome = 'High risk';
  } else if (riskPercentage >= 35) {
    outcome = 'Moderate risk';
  }

  const summary =
    outcome === 'High risk'
      ? 'Your daily health log shows several warning signals. Review the highlighted body zones and consider medical advice if symptoms are active.'
      : outcome === 'Moderate risk'
        ? 'Your health log shows some instability today. The highlighted body zones may need extra monitoring.'
        : 'Your daily health signals appear relatively stable today. Keep tracking to spot any trend changes early.';

  return {
    riskPercentage,
    outcome,
    summary,
    riskDrivers,
    recommendations,
    highlightedZones: Array.from(highlightedZones),
    alerts,
    metrics: {
      bloodSugarState,
      bloodPressureState,
      heartRateState,
      hydrationState,
    },
  };
}
