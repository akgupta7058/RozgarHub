import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Worker, NewWorkerInput, SpamReport, WorkerStatus } from '../types/worker';

const WORKERS_COLLECTION = 'workers';

/**
 * Clean up all legacy test/dummy worker documents (e.g. sample_*)
 * so only real submitted workers exist.
 */
export async function cleanUpDummyWorkers(): Promise<void> {
  try {
    const colRef = collection(db, WORKERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const deletePromises: Promise<void>[] = [];

    snapshot.forEach((docSnap) => {
      const docId = docSnap.id;
      // Delete sample_* or unverified dummy seed workers
      if (docId.startsWith('sample_')) {
        deletePromises.push(deleteDoc(docSnap.ref));
      }
    });

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`RozgarHub: Purged ${deletePromises.length} dummy/sample profiles.`);
    }
  } catch (error) {
    console.warn('Could not clean up dummy workers:', error);
  }
}

/**
 * Real-time listener for workers collection
 * Returns all workers (used by Admin Dashboard and Home Screen filtering)
 */
export function subscribeToWorkers(
  onSuccess: (workers: Worker[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, WORKERS_COLLECTION);

  // Trigger one-time cleanup of legacy sample profiles
  cleanUpDummyWorkers().catch((err) => {
    console.warn('Cleanup check error:', err);
  });

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const workers: Worker[] = [];
      snapshot.forEach((docSnap) => {
        const docId = docSnap.id;
        // Skip any sample_* documents
        if (docId.startsWith('sample_')) {
          return;
        }

        const data = docSnap.data();
        const spamCount = Number(data.spamCount) || 0;
        let status: WorkerStatus = data.status || 'pending';

        // Auto-block rule: if spamCount >= 3, enforce blocked status
        if (spamCount >= 3 && status !== 'blocked') {
          status = 'blocked';
        }

        workers.push({
          id: docSnap.id,
          name: data.name ?? 'Karmachari',
          category: data.category ?? 'Rajmistri',
          dailyRate: Number(data.dailyRate) || 500,
          experienceYears: Number(data.experienceYears) || 0,
          phone: data.phone ?? '',
          city: data.city ?? '',
          area: data.area ?? '',
          description: data.description ?? '',
          photoBase64: data.photoBase64 || '',
          status,
          spamCount,
          reports: Array.isArray(data.reports) ? data.reports : [],
          verified: data.verified ?? (status === 'approved'),
          rating: Number(data.rating) || 5.0,
          reviewsCount: Number(data.reviewsCount) || 1,
          availableToday: data.availableToday ?? true,
          skills: Array.isArray(data.skills) ? data.skills : [],
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });

      // Sort: newest first
      workers.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      onSuccess(workers);
    },
    (err) => {
      console.error('Firestore subscription error:', err);
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
 * Default status: 'pending', spamCount: 0, reports: []
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
    photoBase64: input.photoBase64,
    status: 'pending', // Pending WhatsApp / Admin verification
    spamCount: 0,
    reports: [],
    verified: false,
    rating: 5.0,
    reviewsCount: 0,
    availableToday: input.availableToday ?? true,
    skills: input.skills && input.skills.length > 0 ? input.skills : [input.category],
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
 * Admin Action: Update worker status (Approve, Block, or Pending)
 */
export async function updateWorkerStatus(
  workerId: string,
  newStatus: WorkerStatus,
  resetSpam: boolean = false
): Promise<void> {
  const docRef = doc(db, WORKERS_COLLECTION, workerId);
  try {
    const updateData: Partial<Worker> = {
      status: newStatus,
      verified: newStatus === 'approved',
    };
    if (resetSpam) {
      updateData.spamCount = 0;
    }
    await updateDoc(docRef, updateData as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${WORKERS_COLLECTION}/${workerId}`);
  }
}

/**
 * Admin Action: Permanently delete a worker document
 */
export async function deleteWorkerPermanently(workerId: string): Promise<void> {
  const docRef = doc(db, WORKERS_COLLECTION, workerId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${WORKERS_COLLECTION}/${workerId}`);
  }
}

/**
 * Customer Action: Report Spam / Dalal
 * Increments spamCount, adds report record.
 * 3-strike rule: If spamCount >= 3, automatically sets status to 'blocked'
 */
export async function reportWorkerSpam(
  workerId: string,
  reason: string,
  details?: string
): Promise<{ newSpamCount: number; isBlocked: boolean }> {
  const docRef = doc(db, WORKERS_COLLECTION, workerId);

  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error('Worker profile not found');
    }

    const data = snap.data();
    const currentSpamCount = Number(data.spamCount) || 0;
    const currentReports: SpamReport[] = Array.isArray(data.reports) ? data.reports : [];

    const newReport: SpamReport = {
      id: `rep_${Date.now()}`,
      reason,
      details: details ? details.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    const newSpamCount = currentSpamCount + 1;
    const isBlocked = newSpamCount >= 3;

    const updates: Partial<Worker> = {
      spamCount: newSpamCount,
      reports: [...currentReports, newReport],
    };

    if (isBlocked) {
      updates.status = 'blocked';
      updates.verified = false;
    }

    await updateDoc(docRef, updates as any);
    return { newSpamCount, isBlocked };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${WORKERS_COLLECTION}/${workerId}`);
  }
}

/**
 * Update worker availability toggle
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
