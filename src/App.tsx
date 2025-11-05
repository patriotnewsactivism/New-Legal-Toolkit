// src/App.tsx
import React from "react";
import LegalToolkitPro from "@/components/LegalToolkitPro";
import { PublicRecordsToolkit } from "@/components/PublicRecordsToolkit";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const App: React.FC = () => {
  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl py-6 px-4">
          <Tabs defaultValue="enhanced" className="w-full">
            <div className="mb-6 flex justify-center">
              <TabsList>
                <TabsTrigger value="enhanced">Enhanced Public Records Toolkit</TabsTrigger>
                <TabsTrigger value="classic">Classic Legal Toolkit</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="enhanced">
              <PublicRecordsToolkit />
            </TabsContent>
            <TabsContent value="classic">
              <LegalToolkitPro />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SubscriptionProvider>
  );
};

export default App;

