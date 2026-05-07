
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, push, set, remove, get } from "firebase/database";

export interface Transaction {
  id: string;
  n: string; // member name
  a: number; // amount
  d: string; // date YYYY-MM-DD
  c?: string; // category
}

export const useMinarData = () => {
  const [members, setMembers] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultMembers = [
    "Mr. Dulal", "Mr. Omar Faruk", "Mr. Sulaiman badshah", "Mr. Abdul qayum",
    "Mr. Mohammed Jamshed", "Mr. Milad", "Mr. Ala uddin", "Mr. Shahid",
    "Mr. Shohag", "Mr. Abul Hussain", "Mr. Sakib", "Mr. Ronnie",
    "Mr. Jonye", "Mr. Aqib", "Mr. Shahid (Member)"
  ];

  useEffect(() => {
    const membersRef = ref(db, "member_list");
    const transRef = ref(db, "transactions");

    const unsubMembers = onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMembers(Object.values(data));
      } else {
        // Initialize with default members if empty
        defaultMembers.forEach(name => {
          const newRef = push(ref(db, "member_list"));
          set(newRef, name);
        });
      }
    });

    const unsubTrans = onValue(transRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transList: Transaction[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setTransactions(transList.sort((a, b) => new Date(b.d).getTime() - new Date(a.d).getTime()));
      } else {
        setTransactions([]);
      }
      setLoading(false);
    });

    return () => {
      unsubMembers();
      unsubTrans();
    };
  }, []);

  const addMember = async (name: string) => {
    if (!name) return;
    const membersRef = ref(db, "member_list");
    const newRef = push(membersRef);
    await set(newRef, name);
  };

  const deleteMember = async (name: string) => {
    const membersRef = ref(db, "member_list");
    const snapshot = await get(membersRef);
    const data = snapshot.val();
    if (data) {
      const entry = Object.entries(data).find(([_, val]) => val === name);
      if (entry) {
        await remove(ref(db, `member_list/${entry[0]}`));
      }
    }
  };

  const addTransaction = async (member: string, amount: number, date: string, category: string) => {
    const transRef = ref(db, "transactions");
    const newRef = push(transRef);
    await set(newRef, { n: member, a: amount, d: date, c: category });
  };

  const deleteTransaction = async (id: string) => {
    await remove(ref(db, `transactions/${id}`));
  };

  return {
    members,
    transactions,
    loading,
    addMember,
    deleteMember,
    addTransaction,
    deleteTransaction
  };
};
