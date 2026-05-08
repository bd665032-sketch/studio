
"use client";

import { useCollection, useFirestore } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useMemo } from "react";

/**
 * useMinarData Hook
 * This file handles all the database (Firebase) logic for the Admin Panel.
 * Standardized field names: memberName, amount, date, category, timestamp
 */

export interface Transaction {
  id: string;
  memberName: string;
  amount: number;
  date: string;
  category: string;
}

export const useMinarData = () => {
  const db = useFirestore();

  // Fetching Members List
  const membersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "members"), orderBy("name"));
  }, [db]);
  const { data: membersDocs } = useCollection(membersQuery);
  const members = useMemo(() => (membersDocs || []).map(d => d.name as string), [membersDocs]);

  // Fetching Transactions List (Synced across app)
  const transactionsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "transactions"), orderBy("date", "desc"));
  }, [db]);
  const { data: transactionsDocs } = useCollection(transactionsQuery);
  
  const transactions: Transaction[] = useMemo(() => (transactionsDocs || []).map(d => ({
    id: d.id,
    memberName: d.memberName || "Unknown",
    amount: Number(d.amount) || 0,
    date: d.date || "",
    category: d.category || "General",
  })), [transactionsDocs]);

  const addMember = async (name: string) => {
    if (!db || !name.trim()) return;
    addDoc(collection(db, "members"), { 
      name: name.trim(), 
      createdAt: serverTimestamp() 
    });
  };

  const deleteMember = async (name: string) => {
    if (!db || !membersDocs) return;
    const memberDoc = membersDocs.find(d => d.name === name);
    if (memberDoc) deleteDoc(doc(db, "members", memberDoc.id));
  };

  const addTransaction = async (member: string, amount: number, date: string, category: string) => {
    if (!db || !member) return;
    addDoc(collection(db, "transactions"), { 
      memberName: member, 
      amount: Number(amount), 
      date, 
      category, 
      timestamp: serverTimestamp() 
    });
  };

  const deleteTransaction = async (id: string) => {
    if (!db || !id) return;
    deleteDoc(doc(db, "transactions", id));
  };

  return { members, transactions, addMember, deleteMember, addTransaction, deleteTransaction };
};
