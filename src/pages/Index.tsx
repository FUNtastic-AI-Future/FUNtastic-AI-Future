import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PodcastPersonaCard } from "@/components/PodcastPersonaCard";
import { GenerationControls } from "@/components/GenerationControls";
import { EpisodeHistory } from "@/components/EpisodeHistory";
import { NewsSourcesWidget } from "@/components/NewsSourcesWidget";
import { ApiConfiguration, ApiConfig } from "@/components/ApiConfiguration";
import { PodcastGenerator, GeneratedPodcast } from "@/services/PodcastGenerator";
import heroImage from "@/assets/podcast-hero.jpg";
import { 
  Play, 
  Pause, 
  Clock, 
  Calendar,
  TrendingUp,
  Users,
  Mic,
  Radio,
  Settings
} from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationProgress, setGenerationProgress] = useState("");
  const [nextEpisodeDate] = useState(new Date('2024-01-19'));
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
  const [podcastGenerator] = useState(new PodcastGenerator());
  const [latestPodcast, setLatestPodcast] = useState<GeneratedPodcast | null>(null);

  // Načíst uloženou konfiguraci při startu
  useState(() => {
    const savedConfig = localStorage.getItem('podcastApiConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setApiConfig(config);
        podcastGenerator.setConfig(config);
      } catch (e) {
        console.error('Chyba při načítání API konfigurace:', e);
      }
    }
  });

  const handleApiConfigSave = useCallback((config: ApiConfig) => {
    setApiConfig(config);
    podcastGenerator.setConfig(config);
    localStorage.setItem('podcastApiConfig', JSON.stringify(config));
    toast.success("API konfigurace uložena");
  }, [podcastGenerator]);

  const handleStartGeneration = useCallback(async () => {
    if (!apiConfig) {
      setShowApiConfig(true);
      toast.error("Nejprve nastavte API klíče");
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);
    
    try {
      const podcast = await podcastGenerator.generateWeeklyPodcast(
        (step: string, progress: number) => {
          setGenerationProgress(step);
          setGenerationStep(Math.floor(progress / 16.67)); // 0-5 steps
        }
      );
      
      setLatestPodcast(podcast);
      toast.success("Podcast úspěšně vygenerován!");
    } catch (error) {
      console.error('Chyba při generování:', error);
      toast.error("Chyba při generování podcastu: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
      setGenerationProgress("");
    }
  }, [apiConfig, podcastGenerator]);

  const handleStopGeneration = useCallback(() => {
    setIsGenerating(false);
    setGenerationStep(0);
    setGenerationProgress("");
    toast.info("Generování zastaveno");
  }, []);

  // Kontrola jestli jsou API klíče nastavené
  const hasApiKeys = apiConfig?.elevenLabs && apiConfig?.openai;

  const personas = [
    {
      id: "petr",
      name: "Petr Mára",
      role: "Analytik trendů",
      description: "Zaměřuje se na makro trendy v AI, automatizaci, průmyslu 4.0, Web3, kvantových technologiích",
      avatar: "/api/placeholder/120/120",
      voiceId: "petr_czech_voice",
      gradient: "from-blue-400 to-purple-600",
      sources: ["Gartner", "McKinsey", "CB Insights", "MIT Technology Review"],
      currentTopics: 3,
      status: "ready" as const
    },
    {
      id: "lubo", 
      name: "Lubo Smid",
      role: "Technický expert",
      description: "Konkrétní nové nástroje, frameworky, API, knihovny, pokroky v modelování, hardware",
      avatar: "/api/placeholder/120/120",
      voiceId: "lubo_czech_voice",
      gradient: "from-green-400 to-blue-500",
      sources: ["Hacker News", "GitHub Trending", "Papers with Code", "arXiv"],
      currentTopics: 4,
      status: "collecting" as const
    },
    {
      id: "jarda",
      name: "Jarda Beck", 
      role: "UX/Produkt specialista",
      description: "Praktické využití, uživatelské chování, reálné případovky, nové startupy",
      avatar: "/api/placeholder/120/120",
      voiceId: "jarda_czech_voice",
      gradient: "from-pink-400 to-orange-500",
      sources: ["Product Hunt", "IndieHackers", "TechCrunch Startups"],
      currentTopics: 2,
      status: "ready" as const
    }
  ];

  const generationSteps = [
    "Sběr novinek z online zdrojů",
    "Analýza a výběr top témat",
    "Generování scénáře podcastu",
    "Tvorba AI hlasů",
    "Post-processing a finalizace",
    "Publikování na platformy"
  ];

  const daysUntilNext = Math.ceil((nextEpisodeDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative mb-12 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10"></div>
        <img 
          src={heroImage} 
          alt="AI Podcast Studio"
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center space-y-4 p-8 bg-background/20 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-primary rounded-xl shadow-glow-primary">
                <Radio className="h-8 w-8 text-primary-foreground animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  FUNtastic-AI-Future : PodcastWeb
                </h1>
                <p className="text-primary-foreground/90 text-lg mt-2">
                  Automatizovaný generátor týdenního tech podcastu s AI specialisty
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration Button */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={() => setShowApiConfig(true)}
          variant={hasApiKeys ? "outline" : "default"}
          size="lg"
          className={hasApiKeys ? 
            "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20" : 
            "bg-gradient-primary hover:shadow-glow-primary"
          }
        >
          <Settings className="h-4 w-4 mr-2" />
          {hasApiKeys ? "Upravit API klíče" : "Nastavit API klíče"}
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <Card className="bg-gradient-card border-border/50 shadow-tech-card">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">{daysUntilNext}</div>
            <p className="text-sm text-muted-foreground">dní do další epizody</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border/50 shadow-tech-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent">127</div>
            <p className="text-sm text-muted-foreground">novinek tento týden</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-tech-card">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-primary-glow mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary-glow">3</div>
            <p className="text-sm text-muted-foreground">AI specialisti</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-tech-card">
          <CardContent className="p-4 text-center">
            <Mic className="h-6 w-6 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent">15</div>
            <p className="text-sm text-muted-foreground">epizod celkem</p>
          </CardContent>
        </Card>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="max-w-4xl mx-auto bg-gradient-card border-primary/20 shadow-glow-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              Generování podcastu probíhá
            </CardTitle>
            <CardDescription>
              Aktuální krok: {generationSteps[generationStep]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(generationStep + 1) / generationSteps.length * 100} className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              {generationSteps.map((step, index) => (
                <div 
                  key={index}
                  className={`p-2 rounded-lg ${
                    index < generationStep ? 'bg-primary/20 text-primary' :
                    index === generationStep ? 'bg-accent/20 text-accent' :
                    'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < generationStep ? '✓' : index === generationStep ? '⏳' : '⏸'} {step}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Personas */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">AI Specialisté</h2>
          <p className="text-muted-foreground">
            Každý týden si připraví 2-3 témata ze své oblasti expertise
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {personas.map((persona) => (
            <PodcastPersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      </div>

      <Separator className="max-w-4xl mx-auto" />

      {/* Generation Controls */}
      <GenerationControls 
        isGenerating={isGenerating}
        onStartGeneration={handleStartGeneration}
        onStopGeneration={handleStopGeneration}
        nextEpisodeDate={nextEpisodeDate}
        hasApiKeys={!!hasApiKeys}
        currentStep={generationProgress}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* News Sources */}
        <NewsSourcesWidget />
        
        {/* Episode History */}
        <EpisodeHistory />
      </div>

      {/* API Configuration Modal */}
      <ApiConfiguration
        isOpen={showApiConfig}
        onClose={() => setShowApiConfig(false)}
        onSave={handleApiConfigSave}
      />
    </div>
  );
};

export default Index;