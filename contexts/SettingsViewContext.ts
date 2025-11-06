import { createContext, useContext } from 'react';
import { UseSettingsViewReturnType } from '../hooks/useSettingsView';

export const SettingsViewContext = createContext<UseSettingsViewReturnType | null>(null);

export const useSettingsViewContext = () => {
    const context = useContext(SettingsViewContext);
    if (!context) {
        throw new Error('useSettingsViewContext must be used within a SettingsViewProvider');
    }
    return context;
};