import {DailyMonitoringInput, DailyMonitoringResult} from './dailyMonitoringService';

export type MonitoringHistoryEntry = {
  id: string;
  createdAt: string;
  patientId: string;
  patientName: string;
  form: DailyMonitoringInput;
  result: DailyMonitoringResult;
  shareId: string;
};

export type OfflineSyncItem = {
  id: string;
  createdAt: string;
  type: 'daily-monitoring';
  status: 'queued';
  payload: DailyMonitoringInput;
};

const historyKey = (userId: string) => `healthpulse-monitoring-history-${userId}`;
const syncQueueKey = (userId: string) => `healthpulse-sync-queue-${userId}`;

function readList<T>(key: string) {
  const raw = localStorage.getItem(key);
  if (!raw) return [] as T[];

  try {
    return JSON.parse(raw) as T[];
  } catch (error) {
    console.error(`Failed to parse local data for ${key}:`, error);
    return [] as T[];
  }
}

export function getMonitoringHistory(userId: string) {
  return readList<MonitoringHistoryEntry>(historyKey(userId));
}

export function saveMonitoringHistoryEntry(entry: MonitoringHistoryEntry) {
  const current = getMonitoringHistory(entry.patientId);
  const next = [entry, ...current].slice(0, 20);
  localStorage.setItem(historyKey(entry.patientId), JSON.stringify(next));
}

export function findSharedReport(shareId: string) {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith('healthpulse-monitoring-history-'));

  for (const key of keys) {
    const entries = readList<MonitoringHistoryEntry>(key);
    const match = entries.find((entry) => entry.shareId === shareId);
    if (match) {
      return match;
    }
  }

  return null;
}

export function queueOfflineSync(userId: string, payload: DailyMonitoringInput) {
  const current = readList<OfflineSyncItem>(syncQueueKey(userId));
  const entry: OfflineSyncItem = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    type: 'daily-monitoring',
    status: 'queued',
    payload,
  };
  const next: OfflineSyncItem[] = [entry, ...current].slice(0, 10);

  localStorage.setItem(syncQueueKey(userId), JSON.stringify(next));
  return next;
}

export function getOfflineSyncQueue(userId: string) {
  return readList<OfflineSyncItem>(syncQueueKey(userId));
}

export function clearOfflineSyncQueue(userId: string) {
  localStorage.removeItem(syncQueueKey(userId));
}
