
"use client";

import { useCollection, useFirestore } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useMemo } from "react";

export interface Transaction {
  id: string;
  n: string; // member name
  a: number; // amount
  d: string; // date YYYY-MM-DD
  c?: string; // category
  timestamp?: any;
}

export const useMinarData = () => {
  const db = useFirestore();

  // Members - Using onSnapshot via useCollection for real-time updates
  const membersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "members"), orderBy("name"));
  }, [db]);
  
  const { data: membersDocs, loading: membersLoading } = useCollection(membersQuery);
  
  // Robust member mapping
  const members = useMemo(() => {
    return (membersDocs || []).map(d => d.name as string).filter(Boolean);
  }, [membersDocs]);

  // Transactions
  const transactionsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "transactions"), orderBy("date", "desc"));
  }, [db]);
  
  const { data: transactionsDocs, loading: transactionsLoading } = useCollection(transactionsQuery);
  
  const transactions: Transaction[] = useMemo(() => {
    return (transactionsDocs || []).map(d => ({
      id: d.id,
      n: d.memberName || "Unknown",
      a: d.amount || 0,
      d: d.date || "",
      c: d.category || "General",
      timestamp: d.timestamp
    }));
  }, [transactionsDocs]);

  const addMember = async (name: string) => {
    if (!db || !name.trim()) return;
    try {
      await addDoc(collection(db, "members"), { 
        name: name.trim(), 
        createdAt: serverTimestamp() 
      });
    } catch (e) {
      console.error("Error adding member:", e);
    }
  };

  const deleteMember = async (name: string) => {
    if (!db) return;
    const memberDoc = membersDocs?.find(d => d.name === name);
    if (memberDoc) {
      try {
        await deleteDoc(doc(db, "members", memberDoc.id));
      } catch (e) {
        console.error("Error deleting member:", e);
      }
    }
  };

  const addTransaction = async (member: string, amount: number, date: string, category: string) => {
    if (!db || !member) return;
    try {
      await addDoc(collection(db, "transactions"), {
        memberName: member,
        amount,
        date,
        category,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding transaction:", e);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!db || !id) return;
    try {
      await deleteDoc(doc(db, "transactions", id));
    } catch (e) {
      console.error("Error deleting transaction:", e);
    }
  };

  return {
    members,
    transactions,
    loading: membersLoading || transactionsLoading,
    addMember,
    deleteMember,
    addTransaction,
    deleteTransaction
  };
};
