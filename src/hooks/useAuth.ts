/**
 * Hook auxiliar para consumir o contexto de autenticacao com tipagem segura.
 */
import { useContext } from 'react';

import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
