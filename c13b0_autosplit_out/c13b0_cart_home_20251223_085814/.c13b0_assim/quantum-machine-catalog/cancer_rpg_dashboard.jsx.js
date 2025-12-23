import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, FlaskConical, Globe, Microscope } from "lucide-react";

export default function CancerResearchRPG() {
  return (
    <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <Card className="bg-gradient-to-br from-purple-100 to-indigo-100">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Microscope className="text-indigo-500" /> Oncology Trials Explorer
          </h2>
          <p>Track and engage with real-time global clinical trials. Discover newly approved drugs and experimental protocols.</p>
          <Button className="mt-3 w-full">Launch Trials Map</Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-100 to-emerald-100">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Globe className="text-emerald-500" /> Environment Watch
          </h2>
          <p>Scan the planet for cancer-like ecological patterns—oil spills, microplastic clusters, toxic zones.</p>
          <Button className="mt-3 w-full">Scan World</Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-pink-100 to-red-100">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Book className="text-red-500" /> Knowledge Codex
          </h2>
          <p>Access curated research papers, therapy timelines, and molecular breakthroughs by year and region.</p>
          <Button className="mt-3 w-full">Open Codex</Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-100 to-cyan-100">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <FlaskConical className="text-cyan-500" /> BioLab RPG Engine
          </h2>
          <p>Choose your role (e.g., Onco-Detective, Immuno-Engineer) and tackle missions inspired by real research milestones.</p>
          <Tabs defaultValue="engineer" className="w-full mt-3">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="detective">🕵️‍♂️ Onco-Detective</TabsTrigger>
              <TabsTrigger value="engineer">🧬 Immuno-Engineer</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button className="mt-3 w-full">Start Quest</Button>
        </CardContent>
      </Card>
    </div>
  );
}
