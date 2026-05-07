
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

  // Members
  const membersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "members"), orderBy("name"));
  }, [db]);
  const { data: membersDocs, loading: membersLoading } = useCollection(membersQuery);
  const members = membersDocs?.map(d => d.name) || [];

  // Transactions
  const transactionsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "transactions"), orderBy("date", "desc"));
  }, [db]);
  const { data: transactionsDocs, loading: transactionsLoading } = useCollection(transactionsQuery);
  
  const transactions: Transaction[] = transactionsDocs?.map(d => ({
    id: d.id,
    n: d.memberName,
    a: d.amount,
    d: d.date,
    c: d.category,
    timestamp: d.timestamp
  })) || [];

  const addMember = async (name: string) => {
    if (!db || !name) return;
    addDoc(collection(db, "members"), { name, createdAt: serverTimestamp() });
  };

  const deleteMember = async (name: string) => {
    if (!db) return;
    const memberDoc = membersDocs?.find(d => d.name === name);
    if (memberDoc) {
      deleteDoc(doc(db, "members", memberDoc.id));
    }
  };

  const addTransaction = async (member: string, amount: number, date: string, category: string) => {
    if (!db) return;
    addDoc(collection(db, "transactions"), {
      memberName: member,
      amount,
      date,
      category,
      timestamp: serverTimestamp()
    });
  };

  const deleteTransaction = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, "transactions", id));
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
