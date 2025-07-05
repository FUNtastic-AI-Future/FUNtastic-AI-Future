import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Globe,
  TrendingUp,
  Users,
  Code,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

interface NewsSource {
  name: string;
  type: "rss" | "api" | "scraping";
  category: "trends" | "technical" | "product";
  status: "active" | "error" | "rate_limited";
  itemsToday: number;
  lastUpdate: string;
  icon: React.ReactNode;
}

export const NewsSourcesWidget = () => {
  const sources: NewsSource[] = [
    {
      name: "Hacker News",
      type: "api",
      category: "technical",
      status: "active",
      itemsToday: 23,
      lastUpdate: "před 15 min",
      icon: <Code className="h-4 w-4" />
    },
    {
      name: "TechCrunch",
      type: "rss",
      category: "trends",
      status: "active", 
      itemsToday: 12,
      lastUpdate: "před 22 min",
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      name: "Product Hunt",
      type: "api",
      category: "product",
      status: "active",
      itemsToday: 8,
      lastUpdate: "před 30 min", 
      icon: <Smartphone className="h-4 w-4" />
    },
    {
      name: "Reddit r/technology",
      type: "api",
      category: "trends",
      status: "rate_limited",
      itemsToday: 5,
      lastUpdate: "před 2 hod",
      icon: <Users className="h-4 w-4" />
    },
    {
      name: "ArXiv AI Papers",
      type: "api",
      category: "technical",
      status: "active",
      itemsToday: 18,
      lastUpdate: "před 45 min",
      icon: <Code className="h-4 w-4" />
    },
    {
      name: "MIT Technology Review",
      type: "rss",
      category: "trends",
      status: "error",
      itemsToday: 0,
      lastUpdate: "před 6 hod",
      icon: <Globe className="h-4 w-4" />
    }
  ];

  const getStatusIcon = (status: NewsSource["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3 text-green-400" />;
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-400" />;
      case "rate_limited":
        return <Loader2 className="h-3 w-3 text-yellow-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: NewsSource["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "error":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "rate_limited":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }
  };

  const getCategoryIcon = (category: NewsSource["category"]) => {
    switch (category) {
      case "trends":
        return <TrendingUp className="h-3 w-3 text-blue-400" />;
      case "technical":
        return <Code className="h-3 w-3 text-green-400" />;
      case "product":
        return <Smartphone className="h-3 w-3 text-purple-400" />;
    }
  };

  const getCategoryLabel = (category: NewsSource["category"]) => {
    switch (category) {
      case "trends":
        return "Trendy";
      case "technical":
        return "Technické";
      case "product":
        return "Produktové";
    }
  };

  const totalItemsToday = sources.reduce((sum, source) => sum + source.itemsToday, 0);
  const activeSourcesCount = sources.filter(s => s.status === "active").length;
  const healthPercentage = (activeSourcesCount / sources.length) * 100;

  return (
    <Card className="bg-gradient-card border-border/50 shadow-tech-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Zdroje novinek
        </CardTitle>
        <CardDescription>
          Monitoring tech novinek z různých platforem
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/20 rounded-lg">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">{totalItemsToday}</div>
            <p className="text-xs text-muted-foreground">novinek dnes</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-accent">{activeSourcesCount}/{sources.length}</div>
            <p className="text-xs text-muted-foreground">aktivních zdrojů</p>
          </div>
        </div>

        {/* Health Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stav systému</span>
            <span className="text-primary font-medium">{Math.round(healthPercentage)}%</span>
          </div>
          <Progress value={healthPercentage} className="h-2" />
        </div>

        {/* Sources List */}
        <div className="space-y-2">
          {sources.map((source, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {source.icon}
                  <span className="font-medium text-sm">{source.name}</span>
                </div>
                <div className="flex gap-1">
                  <Badge className={`text-xs px-2 py-0 ${getStatusColor(source.status)}`}>
                    {getStatusIcon(source.status)}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-0 bg-background/50">
                    {getCategoryIcon(source.category)}
                    <span className="ml-1">{getCategoryLabel(source.category)}</span>
                  </Badge>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-accent">{source.itemsToday}</div>
                <div className="text-xs text-muted-foreground">{source.lastUpdate}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Type Distribution */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Distribuce podle typu:</h4>
          <div className="flex gap-2">
            {["api", "rss", "scraping"].map(type => {
              const count = sources.filter(s => s.type === type).length;
              return (
                <Badge key={type} variant="outline" className="bg-background/50 text-xs">
                  {type.toUpperCase()}: {count}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};