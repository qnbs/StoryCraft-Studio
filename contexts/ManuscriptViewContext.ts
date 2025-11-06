import { createContext, useContext } from 'react';
import { UseManuscriptViewReturnType } from '../hooks/useManuscriptView';

export const ManuscriptViewContext = createContext<UseManuscriptViewReturnType | null>(null);

export const useManuscriptViewContext = () => {
    const context = useContext(ManuscriptViewContext);
    if (!context) {
        throw new Error('useManuscriptViewContext must be used within a ManuscriptViewProvider');
    }
    return context;
};
