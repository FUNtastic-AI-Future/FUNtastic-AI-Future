import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play,
  Download,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  ExternalLink
} from "lucide-react";

interface Episode {
  id: number;
  title: string;
  date: string;
  duration: string;
  status: "published" | "processing" | "draft" | "error";
  topics: string[];
  listens: number;
  participants: string[];
}

export const EpisodeHistory = () => {
  const episodes: Episode[] = [
    {
      id: 15,
      title: "AI Breakthrough & Kvantová budoucnost",
      date: "2024-01-12",
      duration: "18:42",
      status: "published",
      topics: ["GPT-4 Turbo", "Kvantové počítače", "OpenAI DevDay"],
      listens: 1247,
      participants: ["Anna", "Tomáš", "Eva"]
    },
    {
      id: 14,
      title: "Web3 Reality Check & Nové Frameworky",
      date: "2024-01-05",
      duration: "22:15",
      status: "published", 
      topics: ["Next.js 14", "Web3 adopce", "AI v UX"],
      listens: 985,
      participants: ["Anna", "Tomáš", "Eva"]
    },
    {
      id: 13,
      title: "CES 2024 Highlights & GitHub Copilot Update",
      date: "2023-12-29",
      duration: "19:33",
      status: "published",
      topics: ["CES novinky", "GitHub Copilot X", "Apple Vision Pro"],
      listens: 1456,
      participants: ["Anna", "Tomáš", "Eva"]
    },
    {
      id: 12,
      title: "Rok 2023 v Tech - Retrospektiva",
      date: "2023-12-22",
      duration: "25:18",
      status: "published",
      topics: ["ChatGPT růst", "Twitter/X změny", "AI rok"],
      listens: 2103,
      participants: ["Anna", "Tomáš", "Eva"]
    }
  ];

  const getStatusBadge = (status: Episode["status"]) => {
    const variants = {
      published: "bg-green-500/10 text-green-400 border-green-500/20",
      processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      error: "bg-red-500/10 text-red-400 border-red-500/20"
    };

    const labels = {
      published: "Publikováno",
      processing: "Zpracovává se",
      draft: "Koncept",
      error: "Chyba"
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-tech-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Historie epizod
        </CardTitle>
        <CardDescription>
          Přehled všech vygenerovaných podcastů
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {episodes.map((episode) => (
          <div key={episode.id} className="p-4 bg-background/30 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1">
                <h3 className="font-medium text-foreground leading-tight">
                  {episode.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(episode.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {episode.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {episode.listens.toLocaleString()} poslechů
                  </span>
                </div>
              </div>
              {getStatusBadge(episode.status)}
            </div>

            {/* Topics */}
            <div className="flex flex-wrap gap-1 mb-3">
              {episode.topics.map((topic, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {topic}
                </Badge>
              ))}
            </div>

            {/* Participants */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-1">
                  {episode.participants.map((participant, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-accent/10 text-accent"
                    >
                      {participant}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Play className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Download className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2">
          <Button variant="outline" className="w-full bg-background/50">
            Zobrazit všechny epizody
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};