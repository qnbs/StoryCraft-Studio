import React, { FC, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { useApp } from './hooks/useApp';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ManuscriptView } from './components/ManuscriptView';
import { WriterView } from './components/WriterView';
import { TemplateView } from './components/TemplateView';
import { OutlineGeneratorView } from './components/OutlineGeneratorView';
import { CharacterView } from './components/CharacterView';
import { WorldView } from './components/WorldView';
import { ExportView } from './components/ExportView';
import { SettingsView } from './components/SettingsView';
import { HelpView } from './components/HelpView';
import { WelcomePortal } from './components/WelcomePortal';
import { I18nProvider } from './contexts/I18nContext';
import { useTranslation } from './hooks/useTranslation';
import { AppContext } from './contexts/AppContext';
import { Spinner } from './components/ui/Spinner';
import { selectProjectData } from './features/project/projectSelectors';
import { projectActions } from './features/project/projectSlice';
import { ToastProvider } from './components/ui/Toast';

interface AppProps {
    isNewUser: boolean;
}

const App: FC<AppProps> = ({ isNewUser }) => {
    const appState = useApp({ isNewUser });
    const { currentView, handleNavigate, isPortalActive, isInitialLoad } = appState;
    const settings = useAppSelector((state) => state.settings);
    const project = useAppSelector(selectProjectData);
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(settings.theme === 'light' ? 'light-theme' : 'dark-theme');
    }, [settings.theme]);
    
    useEffect(() => {
        // This effect ensures that if the app loads with a fresh, empty project,
        // it gets populated with the correct translated default title and logline.
        if (!isPortalActive && project && project.title === '' && project.manuscript.length === 0) {
             dispatch(projectActions.resetProject({
                title: t('initialProject.title'),
                logline: t('initialProject.logline')
            }));
            dispatch(projectActions.setManuscript([{ id: `sec-${Date.now()}`, title: t('initialProject.chapter1'), content: '' }]));
        }
    }, [project, isPortalActive, dispatch, t]);

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
            case 'manuscript': return <ManuscriptView />;
            case 'writer': return <WriterView />;
            case 'templates': return <TemplateView onNavigate={handleNavigate as any} />;
            case 'outline': return <OutlineGeneratorView onNavigate={handleNavigate} />;
            case 'characters': return <CharacterView />;
            case 'world': return <WorldView />;
            case 'export': return <ExportView />;
            case 'settings': return <SettingsView />;
            case 'help': return <HelpView />;
            default: return <Dashboard onNavigate={handleNavigate} />;
        }
    };

    if (isInitialLoad) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[var(--background-primary)]">
                <Spinner className="w-16 h-16" />
            </div>
        );
    }
    
    if (isPortalActive) {
        return <WelcomePortal onExit={appState.handlePortalExit} />;
    }

    return (
        <AppContext.Provider value={appState}>
            <div className="flex h-screen bg-[var(--background-primary)] text-[var(--foreground-primary)]">
                <Sidebar currentView={currentView} onNavigate={handleNavigate} isSidebarOpen={appState.isSidebarOpen} setIsSidebarOpen={appState.setIsSidebarOpen} />
                <div className="flex-1 flex flex-col h-screen overflow-hidden pt-16">
                    <Header currentView={currentView} setIsSidebarOpen={appState.setIsSidebarOpen} isSidebarOpen={appState.isSidebarOpen} />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 md:ml-64">
                        {renderView()}
                    </main>
                </div>
            </div>
        </AppContext.Provider>
    );
};

const AppWrapper: FC<AppProps> = (props) => (
    <I18nProvider>
        <ToastProvider>
            <App {...props} />
        </ToastProvider>
    </I18nProvider>
);

export default AppWrapper;