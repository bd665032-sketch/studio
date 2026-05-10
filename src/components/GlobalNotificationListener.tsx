'use client';

import { useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

export function GlobalNotificationListener() {
  const db = useFirestore();
  const { toast } = useToast();
  const isInitialLoad = useRef(true);
  const lastTxId = useRef<string | null>(null);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'), limit(1));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        isInitialLoad.current = false;
        return;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      const currentId = doc.id;

      if (isInitialLoad.current) {
        lastTxId.current = currentId;
        isInitialLoad.current = false;
        return;
      }

      if (currentId !== lastTxId.current) {
        lastTxId.current = currentId;
        
        // Play notification sound
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
        audio.play().catch(e => console.log("Audio play failed", e));

        // Show Facebook style toast
        toast({
          title: "🔔 নতুন জমা পাওয়া গেছে!",
          description: `${data.memberName} জমা দিয়েছেন ৳${data.amount.toLocaleString()}`,
          className: "facebook-toast",
          duration: 5000,
        });
      }
    });

    return () => unsubscribe();
  }, [db, toast]);

  return null;
}
