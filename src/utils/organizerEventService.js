import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// Onaylanmış organizatör etkinliklerini çek
export async function fetchApprovedOrganizerEvents(latitude, longitude, radiusKm = 50) {
  try {
    const q = query(
      collection(db, 'organizer_events'),
      where('status', '==', 'approved')
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(e => e.latitude && e.longitude)
      .map(e => ({
        ...e,
        isEvent: true,
        isOrganizerEvent: true,
      }));
  } catch (e) {
    console.log('Organizatör etkinlik hatası:', e.message);
    return [];
  }
}
