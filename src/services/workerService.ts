import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Worker, NewWorkerInput } from '../types/worker';
import { SAMPLE_WORKERS } from '../data/sampleWorkers';

const WORKERS_COLLECTION = 'workers';

/**
 * Seed initial sample workers into Firestore if collection is empty
 */
export async function seedInitialWorkersIfEmpty(): Promise<void> {
  try {
    const colRef = collection(db, WORKERS_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.log('RozgarHub: Seeding initial 6 realistic Indian worker profiles...');
      for (let i = 0; i < SAMPLE_WORKERS.length; i++) {
        const item = SAMPLE_WORKERS[i];
        const docId = `sample_${i + 1}_${item.category.toLowerCase()}`;
        await setDoc(doc(db, WORKERS_COLLECTION, docId), {
          ...item,
          id: docId,
        });
      }
      console.log('RozgarHub: Seeding completed successfully.');
    }
  } catch (error) {
    console.warn('Could not auto-seed sample workers to Firestore:', error);
  }
}

/**
 * Real-time listener for workers collection
 */
export function subscribeToWorkers(
  onSuccess: (workers: Worker[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, WORKERS_COLLECTION);

  // Trigger seed check in background
  seedInitialWorkersIfEmpty().catch((err) => {
    console.warn('Seed check failed:', err);
  });

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        // If snapshot is empty, fallback to sample workers so UI is never blank
        const fallbackList: Worker[] = SAMPLE_WORKERS.map((w, idx) => ({
          ...w,
          id: `sample_${idx + 1}`,
        }));
        onSuccess(fallbackList);
        return;
      }

      const workers: Worker[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        workers.push({
          id: docSnap.id,
          name: data.name ?? 'Karmachari',
          category: data.category ?? 'Labour',
          dailyRate: Number(data.dailyRate) || 500,
          experienceYears: Number(data.experienceYears) || 1,
          phone: data.phone ?? '9876543210',
          city: data.city ?? 'Delhi NCR',
          area: data.area ?? 'Local Area',
          description: data.description ?? '',
          verified: data.verified ?? true,
          rating: Number(data.rating) || 4.8,
          reviewsCount: Number(data.reviewsCount) || 15,
          availableToday: data.availableToday ?? true,
          avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&q=80',
          skills: Array.isArray(data.skills) ? data.skills : [],
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });

      // Sort by newest first or highest rating
      workers.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      onSuccess(workers);
    },
    (err) => {
      console.error('Firestore subscription error:', err);
      // Fallback to sample data so customer experience is smooth
      const fallbackList: Worker[] = SAMPLE_WORKERS.map((w, idx) => ({
        ...w,
        id: `sample_${idx + 1}`,
      }));
      onSuccess(fallbackList);

      if (onError) {
        try {
          handleFirestoreError(err, OperationType.LIST, WORKERS_COLLECTION);
        } catch (wrapped) {
          onError(wrapped as Error);
        }
      }
    }
  );

  return unsubscribe;
}

/**
 * Register a new worker profile
 */
export async function createWorkerProfile(input: NewWorkerInput): Promise<string> {
  const cleanId = `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, WORKERS_COLLECTION, cleanId);

  const payload: Worker = {
    id: cleanId,
    name: input.name.trim(),
    category: input.category,
    dailyRate: Math.max(100, Number(input.dailyRate)),
    experienceYears: Math.max(0, Number(input.experienceYears)),
    phone: input.phone.trim(),
    city: input.city.trim(),
    area: input.area.trim(),
    description: input.description.trim(),
    verified: true, // Auto-verified in RozgarHub
    rating: 5.0,
    reviewsCount: 1,
    availableToday: input.availableToday ?? true,
    avatarUrl: input.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces&q=80',
    skills: input.skills && input.skills.length > 0 ? input.skills : [input.category + ' Kaam'],
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, payload);
    return cleanId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${WORKERS_COLLECTION}/${cleanId}`);
  }
}

/**
 * Update worker availability status
 */
export async function toggleWorkerAvailability(workerId: string, currentStatus: boolean): Promise<void> {
  const docRef = doc(db, WORKERS_COLLECTION, workerId);
  try {
    await updateDoc(docRef, {
      availableToday: !currentStatus,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${WORKERS_COLLECTION}/${workerId}`);
  }
}
