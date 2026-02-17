import React from 'react';
import { RequireAuth } from './RequireAuth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}