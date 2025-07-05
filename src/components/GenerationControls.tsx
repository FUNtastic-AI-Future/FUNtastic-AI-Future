import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Play,
  Square,
  Clock,
  Calendar,
  Settings,
  Zap,
  Download,
  Upload
} from "lucide-react";

interface GenerationControlsProps {
  isGenerating: boolean;
  onStartGeneration: () => void;
  onStopGeneration: () => void;
  nextEpisodeDate: Date;
}

export const GenerationControls = ({ 
  isGenerating, 
  onStartGeneration, 
  onStopGeneration,
  nextEpisodeDate 
}: GenerationControlsProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('cs-CZ', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="max-w-4xl mx-auto bg-gradient-card border-border/50 shadow-tech-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Ovládání generování
            </CardTitle>
            <CardDescription>
              Spusťte generování nové epizody nebo naplánujte automatické spouštění
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Calendar className="h-3 w-3 mr-1" />
            Další: {formatDate(nextEpisodeDate)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Generation Controls */}
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
          <div className="space-y-1">
            <h3 className="font-medium">Manuální generování</h3>
            <p className="text-sm text-muted-foreground">
              Okamžitě spustí celý proces generování podcastu
            </p>
          </div>
          
          <div className="flex gap-2">
            {!isGenerating ? (
              <Button 
                onClick={onStartGeneration}
                className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
              >
                <Play className="h-4 w-4 mr-2" />
                Spustit generování
              </Button>
            ) : (
              <Button 
                onClick={onStopGeneration}
                variant="destructive"
                className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
              >
                <Square className="h-4 w-4 mr-2" />
                Zastavit
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Automation Settings */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Nastavení automatizace
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="auto-generation" className="text-sm font-medium">
                  Automatické generování
                </Label>
                <p className="text-xs text-muted-foreground">
                  Každý pátek v 10:00
                </p>
              </div>
              <Switch id="auto-generation" defaultChecked />
            </div>

            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="auto-publish" className="text-sm font-medium">
                  Automatické publikování
                </Label>
                <p className="text-xs text-muted-foreground">
                  Na všechny platformy
                </p>
              </div>
              <Switch id="auto-publish" defaultChecked />
            </div>

            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="quality-check" className="text-sm font-medium">
                  Automatická kontrola kvality
                </Label>
                <p className="text-xs text-muted-foreground">
                  AI kontrola před publikováním
                </p>
              </div>
              <Switch id="quality-check" defaultChecked />
            </div>

            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="backup" className="text-sm font-medium">
                  Automatické zálohování
                </Label>
                <p className="text-xs text-muted-foreground">
                  Záloha na cloud storage
                </p>
              </div>
              <Switch id="backup" defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-medium">Rychlé akce</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="bg-background/50">
              <Download className="h-4 w-4 mr-2" />
              Export konfigurace
            </Button>
            <Button variant="outline" size="sm" className="bg-background/50">
              <Upload className="h-4 w-4 mr-2" />
              Import konfigurace
            </Button>
            <Button variant="outline" size="sm" className="bg-background/50">
              <Clock className="h-4 w-4 mr-2" />
              Plánování
            </Button>
          </div>
        </div>

        {/* Status Info */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">
              Systém je připravený k generování • Poslední úspěšná epizoda: před 7 dny
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};