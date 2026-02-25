// Contexto compartilhado de contas bancarias
// Permite que contas criadas em uma tela (ex: Resgate) aparecam em outra (ex: Antecipacao)

import React, { createContext, useContext, useState, useCallback } from 'react';

// Tipos e dados
import { SavedBankAccount, NewAccountFormData, BRAZIL_BANKS } from './11.WithdrawData';

// Interface do contexto
interface SharedAccountsContextType {
  savedAccounts: SavedBankAccount[]; //..Lista de contas salvas
  addAccount: (account: SavedBankAccount) => void; //..Adiciona conta
  updateAccount: (id: string, updatedData: NewAccountFormData) => void; //..Atualiza conta
  deleteAccount: (id: string) => void; //..Remove conta
}

// Contexto com valor padrao undefined (exige Provider)
const SharedAccountsContext = createContext<SharedAccountsContextType | undefined>(undefined);

// Hook para consumir o contexto
export const useSharedAccounts = (): SharedAccountsContextType => {
  const ctx = useContext(SharedAccountsContext);
  if (!ctx) throw new Error('useSharedAccounts deve ser usado dentro de SharedAccountsProvider');
  return ctx;
};

// Provider que envolve as telas da carteira digital
export const SharedAccountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado central das contas salvas
  const [savedAccounts, setSavedAccounts] = useState<SavedBankAccount[]>([]); //..Contas salvas (vazio inicial)

  // Adiciona nova conta
  const addAccount = useCallback((account: SavedBankAccount) => {
    setSavedAccounts(prev => {
      let updated = [...prev];
      if (account.isDefault) {
        updated = updated.map(a => ({ ...a, isDefault: false })); //..Desmarca padrao das outras
      }
      return [...updated, account];
    });
  }, []);

  // Atualiza conta existente
  const updateAccount = useCallback((id: string, updatedData: NewAccountFormData) => {
    const bankInfo = BRAZIL_BANKS.find(b => b.code === updatedData.bankCode);

    setSavedAccounts(prev => prev.map(account => {
      if (account.id !== id) {
        if (updatedData.isDefault) return { ...account, isDefault: false };
        return account;
      }

      return {
        ...account,
        bankName: updatedData.nickname || bankInfo?.name || (updatedData.pixKey ? 'Pix' : account.bankName),
        bankCode: updatedData.bankCode || account.bankCode,
        agency: updatedData.agency || account.agency,
        account: updatedData.account || account.account,
        accountType: updatedData.accountType,
        pixKeyType: updatedData.pixKeyType,
        pixKey: updatedData.pixKey,
        document: updatedData.document || account.document,
        isDefault: updatedData.isDefault,
      };
    }));
  }, []);

  // Remove conta
  const deleteAccount = useCallback((id: string) => {
    setSavedAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <SharedAccountsContext.Provider value={{ savedAccounts, addAccount, updateAccount, deleteAccount }}>
      {children}
    </SharedAccountsContext.Provider>
  );
};
