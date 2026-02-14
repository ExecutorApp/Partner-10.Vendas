// ========================================
// Hook useDrawingElements
// Gerencia todos os elementos de desenho com undo/clear
// ========================================

// ========================================
// Imports React
// ========================================
import { useState, useCallback, useMemo } from 'react';

// ========================================
// Imports de Tipos
// ========================================
import { AnyDrawElement, DrawingCategory } from '../types/editorTypes';

// ========================================
// Tipos do Hook
// ========================================
interface DrawingElementsState {
  elements: AnyDrawElement[];             //......Elementos atuais
  history: AnyDrawElement[][];            //......Historico de estados
  historyIndex: number;                   //......Indice atual no historico
}

interface UseDrawingElementsReturn {
  elements: AnyDrawElement[];             //......Elementos para renderizar
  addElement: (element: AnyDrawElement) => void;  //......Adicionar elemento
  updateElement: (element: AnyDrawElement, addToHistory?: boolean) => void;  //......Atualizar elemento
  deleteElement: (elementId: string) => void;  //......Excluir elemento especifico
  undo: () => void;                       //......Desfazer ultimo
  redo: () => void;                       //......Refazer
  clear: () => void;                      //......Limpar tudo
  clearCategory: (category: DrawingCategory) => void;  //......Limpar categoria
  canUndo: boolean;                       //......Pode desfazer
  canRedo: boolean;                       //......Pode refazer
  hasElements: boolean;                   //......Tem elementos
  hasElementsInCategory: (category: DrawingCategory) => boolean;  //......Tem na categoria
  getElementsByCategory: (category: DrawingCategory) => AnyDrawElement[];  //......Obter por categoria
}

// ========================================
// Gerar ID Unico
// ========================================
export const generateElementId = (): string => {
  return `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ========================================
// Hook Principal
// ========================================
export const useDrawingElements = (): UseDrawingElementsReturn => {
  // ========================================
  // Estado
  // ========================================
  const [state, setState] = useState<DrawingElementsState>({
    elements: [],
    history: [[]],
    historyIndex: 0,
  });

  // ========================================
  // Adicionar Elemento
  // ========================================
  const addElement = useCallback((element: AnyDrawElement) => {
    console.log('🔵 [useDrawingElements] addElement CHAMADO');
    console.log('🔵 [useDrawingElements] Elemento a adicionar:', element.category, element.id);
    setState(prev => {
      console.log('🔵 [useDrawingElements] setState - Elementos ANTES:', prev.elements.length);
      console.log('🔵 [useDrawingElements] setState - IDs existentes:', prev.elements.map(e => e.id));
      const newElements = [...prev.elements, element];
      console.log('🔵 [useDrawingElements] setState - Elementos DEPOIS:', newElements.length);
      console.log('🔵 [useDrawingElements] setState - Novos IDs:', newElements.map(e => e.id));

      // Cortar historia futura se fez undo
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newElements);

      return {
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  // ========================================
  // Atualizar Elemento Existente
  // addToHistory=false para preview durante arraste
  // addToHistory=true para commit final (default)
  // ========================================
  const updateElement = useCallback((element: AnyDrawElement, addToHistory: boolean = false) => {
    setState(prev => {
      const newElements = prev.elements.map(el =>
        el.id === element.id ? element : el
      );

      // Se nada mudou, nao atualizar
      if (newElements === prev.elements) return prev;

      // Se nao for adicionar ao historico, apenas atualizar elementos
      if (!addToHistory) {
        return {
          ...prev,
          elements: newElements,
        };
      }

      // Cortar historia futura se fez undo
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newElements);

      return {
        elements: newElements,
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
        elements: prev.history[newIndex],
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
        elements: prev.history[newIndex],
        historyIndex: newIndex,
      };
    });
  }, []);

  // ========================================
  // Limpar Tudo
  // ========================================
  const clear = useCallback(() => {
    setState(prev => {
      // Adicionar estado vazio ao historico
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([]);

      return {
        elements: [],
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  // ========================================
  // Excluir Elemento Especifico
  // ========================================
  const deleteElement = useCallback((elementId: string) => {
    setState(prev => {
      const newElements = prev.elements.filter(el => el.id !== elementId);

      // Se nada mudou, nao adicionar ao historico
      if (newElements.length === prev.elements.length) return prev;

      // Cortar historia futura se fez undo
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newElements);

      return {
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  // ========================================
  // Limpar Categoria Especifica
  // ========================================
  const clearCategory = useCallback((category: DrawingCategory) => {
    setState(prev => {
      const newElements = prev.elements.filter(el => el.category !== category);

      // Se nada mudou, nao adicionar ao historico
      if (newElements.length === prev.elements.length) return prev;

      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newElements);

      return {
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  // ========================================
  // Verificar se tem elementos na categoria
  // ========================================
  const hasElementsInCategory = useCallback((category: DrawingCategory): boolean => {
    return state.elements.some(el => el.category === category);
  }, [state.elements]);

  // ========================================
  // Obter elementos por categoria
  // ========================================
  const getElementsByCategory = useCallback((category: DrawingCategory): AnyDrawElement[] => {
    return state.elements.filter(el => el.category === category);
  }, [state.elements]);

  // ========================================
  // Valores Computados
  // ========================================
  const canUndo = useMemo(() => state.historyIndex > 0, [state.historyIndex]);
  const canRedo = useMemo(() => state.historyIndex < state.history.length - 1, [state.historyIndex, state.history.length]);
  const hasElements = useMemo(() => state.elements.length > 0, [state.elements.length]);

  // ========================================
  // Retorno
  // ========================================
  return {
    elements: state.elements,
    addElement,
    updateElement,
    deleteElement,
    undo,
    redo,
    clear,
    clearCategory,
    canUndo,
    canRedo,
    hasElements,
    hasElementsInCategory,
    getElementsByCategory,
  };
};

// ========================================
// Export Default
// ========================================
export default useDrawingElements;
