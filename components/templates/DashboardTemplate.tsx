
import React from 'react';

interface DashboardTemplateProps {
    sidebar: React.ReactNode;
    header: React.ReactNode;
    children: React.ReactNode;
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({ sidebar, header, children }) => {
    return (
        <div className="flex h-screen bg-[#FCFAF7] overflow-hidden">
            {sidebar}
            <div className="flex-1 flex flex-col min-w-0 bg-[#FCFAF7]">
                {header}
                <main 
                    className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col"
                    style={{ scrollbarGutter: 'stable' }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
};
