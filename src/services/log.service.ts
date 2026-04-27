import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetId: string;
  details: string;
  timestamp: any;
}

export const logService = {
  async addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    try {
      await addDoc(collection(db, 'logs'), {
        ...log,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'logs');
    }
  },

  subscribeToRecentLogs(callback: (logs: ActivityLog[]) => void, max: number = 20) {
    const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(max));
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
      callback(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'logs');
    });
  }
};
