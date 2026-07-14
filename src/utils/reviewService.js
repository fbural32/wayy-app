import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { containsBadWord } from './distance';
import { BADGES } from '../config/theme';

export async function addReview(userId, placeId, placeCategory, rating, text) {
  if (containsBadWord(text)) {
    // Kullanıcıyı banla
    await updateDoc(doc(db, 'users', userId), { banned: true });
    throw new Error('BAN');
  }

  await addDoc(collection(db, 'reviews'), {
    userId,
    placeId,
    placeCategory,
    rating,
    text,
    createdAt: new Date().toISOString(),
  });

  // Kullanıcıya 20 puan ekle
  const userRef = doc(db, 'users', userId);
  const catKey = `categoryScores.${placeCategory}`;
  await updateDoc(userRef, {
    score: increment(20),
    [catKey]: increment(20),
  });

  // Rozet kontrolü
  await checkBadges(userId);
}

async function checkBadges(userId) {
  const snap = await import('firebase/firestore').then(f => f.getDoc(doc(db, 'users', userId)));
  const data = snap.data();
  const newBadges = [];

  for (const badge of BADGES) {
    if (data.badges?.includes(badge.id)) continue;
    if (badge.category) {
      const catScore = data.categoryScores?.[badge.category] || 0;
      if (catScore >= badge.minScore) newBadges.push(badge.id);
    } else {
      if (data.score >= badge.minScore) newBadges.push(badge.id);
    }
  }

  if (newBadges.length > 0) {
    await updateDoc(doc(db, 'users', userId), {
      badges: arrayUnion(...newBadges),
    });
  }
  return newBadges;
}

export async function getReviews(placeId) {
  const q = query(
    collection(db, 'reviews'),
    where('placeId', '==', placeId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
