// ========================================
// Hook useDrawingHistory
// Gerencia historico de desenho com undo/redo
// ========================================

// ========================================
// Imports React
// ========================================
import { useState, useCallback } from 'react';

// ========================================
// Tipos
// ========================================
export interface DrawPath {
  id: string;                               //......ID unico do path
  points: Array<{ x: number; y: number }>;  //......Pontos do path
  color: string;                            //......Cor do traço
  strokeWidth: number;                      //......Espessura do traço
}

interface DrawingHistoryState {
  paths: DrawPath[];                        //......Paths atuais
  history: DrawPath[][];                    //......Historico de estados
  historyIndex: number;                     //......Indice atual no historico
}

interface UseDrawingHistoryReturn {
  paths: DrawPath[];                        //......Paths para renderizar
  addPath: (path: DrawPath) => void;        //......Adicionar novo path
  undo: () => void;                         //......Desfazer ultima acao
  redo: () => void;                         //......Refazer acao desfeita
  clear: () => void;                        //......Limpar todos os paths
  canUndo: boolean;                         //......Pode desfazer
  canRedo: boolean;                         //......Pode refazer
}

// ========================================
// Hook Principal
// ========================================
export const useDrawingHistory = (): UseDrawingHistoryReturn => {
  // ========================================
  // Estado
  // ========================================
  const [state, setState] = useState<DrawingHistoryState>({
    paths: [],
    history: [[]],
    historyIndex: 0,
  });

  // ========================================
  // Adicionar Path
  // ========================================
  const addPath = useCallback((path: DrawPath) => {
    setState(prev => {
      const newPaths = [...prev.paths, path];

      // Cortar historia futura (se fez undo e depois desenhou algo novo)
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newPaths);

      return {
        paths: newPaths,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  // ========================================
  // Desfazer (Undo)
  // ========================================
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex <= 0) return prev;

      const newIndex = prev.historyIndex - 1;
      return {
        ...prev,
        paths: prev.history[newIndex],
        historyIndex: newIndex,
      };
    });
  }, []);

  // ========================================
  // Refazer (Redo)
  // ========================================
  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;

      const newIndex = prev.historyIndex + 1;
      return {
        ...prev,
        paths: prev.history[newIndex],
        historyIndex: newIndex,
      };
    });
  }, []);

  // ========================================
  // Limpar Tudo
  // ========================================
  const clear = useCallback(() => {
    setState({
      paths: [],
      history: [[]],
      historyIndex: 0,
    });
  }, []);

  // ========================================
  // Retorno
  // ========================================
  return {
    paths: state.paths,
    addPath,
    undo,
    redo,
    clear,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
  };
};

// ========================================
// Export Default
// ========================================
export default useDrawingHistory;
