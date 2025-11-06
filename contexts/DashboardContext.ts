import { createContext, useContext } from 'react';
import { UseManuscriptViewLogicReturnType } from '../hooks/useDashboard';

export const ManuscriptViewContext = createContext<UseManuscriptViewLogicReturnType | null>(null);

export const useManuscriptViewContext = () => {
    const context = useContext(ManuscriptViewContext);
    if (!context) {
        throw new Error('useManuscriptViewContext must be used within a ManuscriptViewProvider');
    }
    return context;
};
