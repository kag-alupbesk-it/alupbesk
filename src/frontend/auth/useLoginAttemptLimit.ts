"use client";

import { useCallback, useState } from "react";

const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const STORAGE_PREFIX = "alupbesk-login-limit:";

interface AttemptRecord {
  count: number;
  blockedUntil: number;
}

function keyFor(email: string) {
  return `${STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

function readRecord(email: string): AttemptRecord {
  if (typeof window === "undefined" || !email.trim()) return { count: 0, blockedUntil: 0 };
  try {
    const value = JSON.parse(window.localStorage.getItem(keyFor(email)) ?? "null") as Partial<AttemptRecord> | null;
    if (!value || typeof value.count !== "number" || typeof value.blockedUntil !== "number") {
      return { count: 0, blockedUntil: 0 };
    }
    if (value.blockedUntil > 0 && value.blockedUntil <= Date.now()) {
      window.localStorage.removeItem(keyFor(email));
      return { count: 0, blockedUntil: 0 };
    }
    return { count: Math.max(0, value.count), blockedUntil: Math.max(0, value.blockedUntil) };
  } catch {
    return { count: 0, blockedUntil: 0 };
  }
}

export function useLoginAttemptLimit() {
  const [revision, setRevision] = useState(0);

  const getStatus = useCallback((email: string) => {
    const record = readRecord(email);
    return {
      ...record,
      remaining: record.blockedUntil > Date.now() ? 0 : Math.max(0, MAX_ATTEMPTS - record.count),
      revision,
    };
  }, [revision]);

  const recordFailure = useCallback((email: string) => {
    const previous = readRecord(email);
    const count = previous.count + 1;
    const record = {
      count,
      blockedUntil: count >= MAX_ATTEMPTS ? Date.now() + LOCK_DURATION_MS : 0,
    };
    try {
      window.localStorage.setItem(keyFor(email), JSON.stringify(record));
    } catch {
      // Supabase Auth rate limits remain active when browser storage is disabled.
    }
    setRevision((value) => value + 1);
    return record;
  }, []);

  const clear = useCallback((email: string) => {
    try {
      window.localStorage.removeItem(keyFor(email));
    } catch {
      // Ignore blocked storage; successful authentication still proceeds.
    }
    setRevision((value) => value + 1);
  }, []);

  return { getStatus, recordFailure, clear };
}
