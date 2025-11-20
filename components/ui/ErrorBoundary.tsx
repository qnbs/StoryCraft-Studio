import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardHeader, CardContent } from './Card';
import { Button } from './Button';
import { ICONS } from '../../constants';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <Card className="max-w-lg w-full text-center animate-in">
                <CardHeader className="flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">{ICONS.LIGHTNING_BOLT}</svg>
                    <h1 className="text-xl font-bold text-red-500">Something went wrong.</h1>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-[var(--foreground-secondary)]">
                        A critical error occurred in this part of the application. Please try reloading the page.
                        If the problem persists, the application state might be corrupted. You may need to reset the project from the settings menu.
                    </p>
                    <Button onClick={() => window.location.reload()} variant="secondary">
                        Reload Page
                    </Button>
                </CardContent>
            </Card>
        </div>
      );
    }

    return this.props.children;
  }
}