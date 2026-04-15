export type Doctor = {
  uid: string;
  displayName: string;
  specialization: string;
  rating?: number;
  clinicName?: string;
  photoURL?: string;
  availability?: 'today' | 'tomorrow' | 'this-week';
  consultationMode?: 'in-person' | 'video' | 'hybrid';
};

export type LocalAppointment = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  status: string;
  type: string;
  createdAt: string;
};

const doctorCatalog: Doctor[] = [
  {uid: 'derm-1', displayName: 'Dr. Aisha Kapoor', specialization: 'Dermatology', rating: 4.9, clinicName: 'ClearSkin Advanced Clinic', photoURL: 'https://picsum.photos/seed/doctor-aisha/200/200', availability: 'today', consultationMode: 'hybrid'},
  {uid: 'derm-2', displayName: 'Dr. Neha Sen', specialization: 'Dermatology', rating: 4.8, clinicName: 'Glow Derma Studio', photoURL: 'https://picsum.photos/seed/doctor-neha/200/200', availability: 'tomorrow', consultationMode: 'video'},
  {uid: 'derm-3', displayName: 'Dr. Rohan Malhotra', specialization: 'Dermatology', rating: 4.7, clinicName: 'Skin Restore Center', photoURL: 'https://picsum.photos/seed/doctor-rohan/200/200', availability: 'this-week', consultationMode: 'in-person'},
  {uid: 'derm-4', displayName: 'Dr. Meera Dutta', specialization: 'Dermatology', rating: 4.8, clinicName: 'Radiant Skin Care Hub', photoURL: 'https://picsum.photos/seed/doctor-meera/200/200', availability: 'today', consultationMode: 'hybrid'},
  {uid: 'dent-1', displayName: 'Dr. Arjun Bhatt', specialization: 'Dentist', rating: 4.9, clinicName: 'Bright Smile Dental', photoURL: 'https://picsum.photos/seed/doctor-arjun/200/200', availability: 'tomorrow', consultationMode: 'in-person'},
  {uid: 'dent-2', displayName: 'Dr. Priya Deshmukh', specialization: 'Dentist', rating: 4.8, clinicName: 'Pearl Tooth Clinic', photoURL: 'https://picsum.photos/seed/doctor-priya/200/200', availability: 'today', consultationMode: 'hybrid'},
  {uid: 'dent-3', displayName: 'Dr. Kunal Iyer', specialization: 'Dentist', rating: 4.7, clinicName: 'Urban Dental Care', photoURL: 'https://picsum.photos/seed/doctor-kunal/200/200', availability: 'this-week', consultationMode: 'video'},
  {uid: 'dent-4', displayName: 'Dr. Sana Ali', specialization: 'Dentist', rating: 4.8, clinicName: 'SmileCraft Hospital', photoURL: 'https://picsum.photos/seed/doctor-sana/200/200', availability: 'tomorrow', consultationMode: 'hybrid'},
  {uid: 'card-1', displayName: 'Dr. Vikram Nair', specialization: 'Cardiology', rating: 4.9, clinicName: 'HeartLine Institute', photoURL: 'https://picsum.photos/seed/doctor-vikram/200/200', availability: 'today', consultationMode: 'hybrid'},
  {uid: 'card-2', displayName: 'Dr. Shalini Roy', specialization: 'Cardiology', rating: 4.8, clinicName: 'Pulse Cardiac Center', photoURL: 'https://picsum.photos/seed/doctor-shalini/200/200', availability: 'this-week', consultationMode: 'video'},
  {uid: 'card-3', displayName: 'Dr. Aditya Bose', specialization: 'Cardiology', rating: 4.7, clinicName: 'Cardio First Clinic', photoURL: 'https://picsum.photos/seed/doctor-aditya/200/200', availability: 'tomorrow', consultationMode: 'in-person'},
  {uid: 'card-4', displayName: 'Dr. Pooja Menon', specialization: 'Cardiology', rating: 4.8, clinicName: 'WellBeat Heart Care', photoURL: 'https://picsum.photos/seed/doctor-pooja/200/200', availability: 'today', consultationMode: 'hybrid'},
  {uid: 'gen-1', displayName: 'Dr. Aman Verma', specialization: 'General', rating: 4.8, clinicName: 'Family Health Point', photoURL: 'https://picsum.photos/seed/doctor-aman/200/200', availability: 'today', consultationMode: 'hybrid'},
  {uid: 'gen-2', displayName: 'Dr. Nandini Ghosh', specialization: 'General', rating: 4.7, clinicName: 'Community Care Clinic', photoURL: 'https://picsum.photos/seed/doctor-nandini/200/200', availability: 'tomorrow', consultationMode: 'video'},
  {uid: 'gen-3', displayName: 'Dr. Rahul Das', specialization: 'General', rating: 4.6, clinicName: 'City Wellness OPD', photoURL: 'https://picsum.photos/seed/doctor-rahul/200/200', availability: 'this-week', consultationMode: 'in-person'},
  {uid: 'gen-4', displayName: 'Dr. Farah Khan', specialization: 'General', rating: 4.8, clinicName: 'Prime Family Practice', photoURL: 'https://picsum.photos/seed/doctor-farah/200/200', availability: 'today', consultationMode: 'hybrid'},
];

function appointmentsKey(patientId: string) {
  return `healthpulse-local-appointments-${patientId}`;
}

export function getDoctorCatalog() {
  return doctorCatalog;
}

export function getLocalAppointments(patientId: string) {
  const raw = localStorage.getItem(appointmentsKey(patientId));
  if (!raw) return [] as LocalAppointment[];

  try {
    return JSON.parse(raw) as LocalAppointment[];
  } catch (error) {
    console.error('Failed to parse local appointments:', error);
    return [] as LocalAppointment[];
  }
}

export function saveLocalAppointment(appointment: Omit<LocalAppointment, 'id' | 'createdAt'>) {
  const current = getLocalAppointments(appointment.patientId);
  const nextAppointment: LocalAppointment = {
    ...appointment,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const next = [nextAppointment, ...current].sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(appointmentsKey(appointment.patientId), JSON.stringify(next));
  return nextAppointment;
}
