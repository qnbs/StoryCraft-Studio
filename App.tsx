import React, { useState } from 'react';
import { View, StoryProject } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TemplateView } from './components/TemplateView';
import { CharacterView } from './components/CharacterView';
import { WorldView } from './components/WorldView';
import { WriterView } from './components/WriterView';
import { ExportView } from './components/ExportView';
import { OutlineGeneratorView } from './components/OutlineGeneratorView';
import { SettingsView } from './components/SettingsView';
import { HelpView } from './components/HelpView';
import { I18nProvider } from './contexts/I18nContext';

// Initial state for a new project
const initialProject: StoryProject = {
  title: 'My Untitled Story',
  logline: 'A journey of a thousand miles begins with a single step...',
  characters: [],
  worlds: [],
  manuscript: [],
};

function StoryCraftApp() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [project, setProject] = useState<StoryProject>(initialProject);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard project={project} setProject={setProject} />;
      case 'templates':
        return <TemplateView setProject={setProject} onNavigate={setCurrentView} />;
      case 'outline':
        return <OutlineGeneratorView setProject={setProject} onNavigate={setCurrentView} />;
      case 'characters':
        return <CharacterView project={project} setProject={setProject} />;
      case 'world':
        return <WorldView project={project} setProject={setProject} />;
      case 'writer':
        return <WriterView />;
      case 'export':
        return <ExportView project={project} />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpView />;
      default:
        return <Dashboard project={project} setProject={setProject} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header setIsSidebarOpen={setIsSidebarOpen} />
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {isSidebarOpen && (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <main className="md:ml-64 pt-16">
        <div className="p-4 md:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <StoryCraftApp />
    </I18nProvider>
  );
}

export default App;