import React, { useState, useEffect } from 'react';
import { SunIcon, MoonIcon, Button } from '@tiptaptoe/ui-components';


export const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(theme === 'dark' || (!theme && systemPrefersDark));
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    return (
        <Button data-style="ghost" onClick={toggleTheme} title="Toggle Theme">
            {isDark ? (
                <SunIcon className="tiptap-button-icon" />
            ) : (
                <MoonIcon className="tiptap-button-icon" />
            )}
        </Button>
    );
};