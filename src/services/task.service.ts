import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  onSnapshot, 
  serverTimestamp,
  orderBy,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  deadline: any;
  createdAt: any;
  updatedAt: any;
}

export const taskService = {
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  },

  async updateTaskStatus(taskId: string, status: Task['status']) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  },

  subscribeToTasks(callback: (tasks: Task[]) => void, filters?: { assignedTo?: string }) {
    let q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    
    if (filters?.assignedTo) {
      q = query(collection(db, 'tasks'), where('assignedTo', '==', filters.assignedTo), orderBy('createdAt', 'desc'));
    }

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      callback(tasks);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });
  },

  async getAllUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  }
};
