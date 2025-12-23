import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function InfinityUI() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white p-6 space-y-6">
      <header className="text-center text-4xl font-bold text-green-400">Infinity Stock Nexus</header>
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-4 gap-2 bg-gray-700 rounded-2xl p-2">
          <TabsTrigger value="dashboard">📈 Dashboard</TabsTrigger>
          <TabsTrigger value="channels">📺 Channels</TabsTrigger>
          <TabsTrigger value="education">📚 Education</TabsTrigger>
          <TabsTrigger value="rpg">🧩 RPG Mode</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {["Renewables", "Circular Logistics", "Biotech", "Civic Tech"].map((sector) => (
              <Card key={sector} className="bg-gray-800 border border-green-500 rounded-2xl shadow-xl">
                <CardContent className="p-4 space-y-2">
                  <h2 className="text-xl font-semibold text-green-300">{sector}</h2>
                  <p className="text-sm text-gray-300">Explore aligned stocks and ETFs.</p>
                  <Button className="bg-green-500 hover:bg-green-600 text-black">Explore {sector}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Channels */}
        <TabsContent value="channels">
          <div className="space-y-4 mt-4">
            {['Safe Haven Picks', 'Systemic Outlook', 'Live Alerts', 'Infinity Watchlist'].map((ch, i) => (
              <Button key={i} className="w-full bg-gray-700 hover:bg-green-600 text-left p-4 rounded-xl text-white shadow-md">
                {ch}
              </Button>
            ))}
          </div>
        </TabsContent>

        {/* Education */}
        <TabsContent value="education">
          <div className="space-y-4 mt-4">
            <Input placeholder="Search topics..." className="bg-gray-700 text-white" icon={<Search />} />
            {['Why oil is obsolete', 'Intro to circular finance', 'Infinity system 101', 'Planetary governance tools'].map((topic, i) => (
              <Card key={i} className="bg-gray-800 border border-green-400 rounded-xl">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-green-300">{topic}</h3>
                  <p className="text-sm text-gray-400">Learn more about {topic.toLowerCase()}.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* RPG Mode */}
        <TabsContent value="rpg">
          <div className="mt-4 space-y-4">
            <Card className="bg-gray-800 border border-purple-500 rounded-xl">
              <CardContent className="p-4">
                <h3 className="text-xl font-bold text-purple-300">🧙 Enter the Ecoverse</h3>
                <p className="text-sm text-gray-300">Choose your avatar and unlock regenerative quests.</p>
                <Button className="mt-2 bg-purple-500 hover:bg-purple-600 text-white">Begin Journey</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
