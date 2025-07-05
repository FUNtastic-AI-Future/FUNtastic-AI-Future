import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User,
  TrendingUp,
  Settings,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";

interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  voiceId: string;
  gradient: string;
  sources: string[];
  currentTopics: number;
  status: "ready" | "collecting" | "processing" | "error";
}

interface PodcastPersonaCardProps {
  persona: Persona;
}

export const PodcastPersonaCard = ({ persona }: PodcastPersonaCardProps) => {
  const getStatusIcon = () => {
    switch (persona.status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "collecting":
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-accent animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (persona.status) {
      case "ready":
        return "Připraveno";
      case "collecting":
        return "Sbírám témata";
      case "processing":
        return "Zpracovávám";
      case "error":
        return "Chyba";
      default:
        return "Neznámý";
    }
  };

  const getStatusColor = () => {
    switch (persona.status) {
      case "ready":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "collecting":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "processing":
        return "bg-accent/10 text-accent border-accent/20";
      case "error":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-tech-card hover:border-primary/30 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`relative p-1 rounded-xl bg-gradient-to-br ${persona.gradient}`}>
              <Avatar className="h-12 w-12 ring-2 ring-background">
                <AvatarImage src={persona.avatar} alt={persona.name} />
                <AvatarFallback className="bg-background/10 text-primary-foreground font-semibold">
                  {persona.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                {getStatusIcon()}
              </div>
            </div>
            <div>
              <CardTitle className="text-lg">{persona.name}</CardTitle>
              <p className="text-sm text-accent font-medium">{persona.role}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor()} px-2 py-1`}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {persona.description}
        </p>

        {/* Topics Count */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Aktuální témata</span>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {persona.currentTopics}
          </Badge>
        </div>

        {/* Data Sources */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Zdroje dat:</h4>
          <div className="flex flex-wrap gap-1">
            {persona.sources.map((source, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs bg-background/50 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {source}
              </Badge>
            ))}
          </div>
        </div>

        {/* Voice Settings */}
        <div className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Hlas:</span>
            <code className="text-xs bg-background/50 px-2 py-1 rounded font-mono">
              {persona.voiceId}
            </code>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200 group-hover:shadow-glow-primary/20"
        >
          <Settings className="h-4 w-4 mr-2" />
          Konfigurace
        </Button>
      </CardContent>
    </Card>
  );
};