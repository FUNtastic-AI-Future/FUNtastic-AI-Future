import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Key,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  TestTube,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  key: string;
  status: "valid" | "invalid" | "untested";
  lastTested?: Date;
}

interface ApiConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ApiConfig) => void;
}

export interface ApiConfig {
  elevenLabs: string;
  openai: string;
  reddit: {
    clientId: string;
    clientSecret: string;
  };
  newsApi: string;
}

export const ApiConfiguration = ({ isOpen, onClose, onSave }: ApiConfigurationProps) => {
  const [config, setConfig] = useState<ApiConfig>({
    elevenLabs: "",
    openai: "",
    reddit: {
      clientId: "",
      clientSecret: ""
    },
    newsApi: ""
  });

  const [showKeys, setShowKeys] = useState({
    elevenLabs: false,
    openai: false,
    reddit: false,
    newsApi: false
  });

  const [keyStatus, setKeyStatus] = useState<Record<string, ApiKey>>({});
  const [isValidating, setIsValidating] = useState(false);

  const apiServices = [
    {
      id: "elevenLabs",
      name: "ElevenLabs",
      description: "Pro generování hlasů AI specialistů",
      placeholder: "sk-...",
      required: true,
      docsUrl: "https://elevenlabs.io/docs/api-reference",
      getUrl: "https://elevenlabs.io/app/speech-synthesis"
    },
    {
      id: "openai", 
      name: "OpenAI",
      description: "Pro generování scénářů a analýzu témat",
      placeholder: "sk-...",
      required: true,
      docsUrl: "https://platform.openai.com/docs/api-reference",
      getUrl: "https://platform.openai.com/api-keys"
    },
    {
      id: "newsApi",
      name: "NewsAPI",
      description: "Pro sběr tech novinek",
      placeholder: "abc123...",
      required: false,
      docsUrl: "https://newsapi.org/docs",
      getUrl: "https://newsapi.org/account"
    }
  ];

  const handleKeyChange = (service: string, value: string) => {
    if (service === "reddit.clientId") {
      setConfig(prev => ({
        ...prev,
        reddit: { ...prev.reddit, clientId: value }
      }));
    } else if (service === "reddit.clientSecret") {
      setConfig(prev => ({
        ...prev,
        reddit: { ...prev.reddit, clientSecret: value }
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [service]: value
      }));
    }
    
    // Reset status when key changes
    setKeyStatus(prev => ({
      ...prev,
      [service]: { key: value, status: "untested" }
    }));
  };

  const validateApiKey = async (service: string, key: string) => {
    setIsValidating(true);
    try {
      // Mock validation - replace with real API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate validation logic
      const isValid = key.length > 10 && (
        (service === "elevenLabs" && key.startsWith("sk_")) ||
        (service === "openai" && key.startsWith("sk-")) ||
        (service === "newsApi" && key.length > 5)
      );

      setKeyStatus(prev => ({
        ...prev,
        [service]: {
          key,
          status: isValid ? "valid" : "invalid",
          lastTested: new Date()
        }
      }));

      toast.success(isValid ? `${service} klíč je platný` : `${service} klíč je neplatný`);
    } catch (error) {
      setKeyStatus(prev => ({
        ...prev,
        [service]: { key, status: "invalid", lastTested: new Date() }
      }));
      toast.error("Chyba při validaci klíče");
    }
    setIsValidating(false);
  };

  const handleSave = () => {
    const requiredKeys = ["elevenLabs", "openai"];
    const missingKeys = requiredKeys.filter(key => !config[key as keyof ApiConfig]);
    
    if (missingKeys.length > 0) {
      toast.error(`Chybí povinné API klíče: ${missingKeys.join(", ")}`);
      return;
    }

    onSave(config);
    toast.success("API konfigurace uložena");
    onClose();
  };

  const getStatusIcon = (status?: "valid" | "invalid" | "untested") => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "invalid":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Key className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-card border-border/50 shadow-tech-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            API Konfigurace
          </CardTitle>
          <CardDescription>
            Nastavte API klíče pro generování podcastů. Všechny klíče jsou uloženy lokálně.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Pro plnou funkčnost potřebujete API klíče od ElevenLabs a OpenAI. 
              Ostatní služby jsou volitelné a můžete je přidat později.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="main" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="main">Hlavní API</TabsTrigger>
              <TabsTrigger value="optional">Volitelné API</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4">
              {apiServices.filter(service => service.required).map((service) => (
                <Card key={service.id} className="bg-background/30 border-border/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {service.name}
                          {service.required && (
                            <Badge variant="destructive" className="text-xs">
                              Povinné
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(service.getUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={service.id}>API Klíč</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id={service.id}
                            type={showKeys[service.id as keyof typeof showKeys] ? "text" : "password"}
                            placeholder={service.placeholder}
                            value={config[service.id as keyof ApiConfig] as string}
                            onChange={(e) => handleKeyChange(service.id, e.target.value)}
                            className="pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowKeys(prev => ({
                              ...prev,
                              [service.id]: !prev[service.id as keyof typeof showKeys]
                            }))}
                          >
                            {showKeys[service.id as keyof typeof showKeys] ? 
                              <EyeOff className="h-4 w-4" /> : 
                              <Eye className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => validateApiKey(service.id, config[service.id as keyof ApiConfig] as string)}
                          disabled={isValidating || !config[service.id as keyof ApiConfig]}
                        >
                          {getStatusIcon(keyStatus[service.id]?.status)}
                          <TestTube className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    
                    {keyStatus[service.id]?.lastTested && (
                      <p className="text-xs text-muted-foreground">
                        Naposledy testováno: {keyStatus[service.id].lastTested?.toLocaleTimeString('cs-CZ')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="optional" className="space-y-4">
              {/* Reddit API */}
              <Card className="bg-background/30 border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Reddit API</CardTitle>
                  <CardDescription>Pro sběr novinek z r/technology, r/MachineLearning</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Client ID</Label>
                      <Input
                        placeholder="abc123..."
                        value={config.reddit.clientId}
                        onChange={(e) => handleKeyChange("reddit.clientId", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Client Secret</Label>
                      <Input
                        type="password"
                        placeholder="xyz789..."
                        value={config.reddit.clientSecret}
                        onChange={(e) => handleKeyChange("reddit.clientSecret", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* NewsAPI */}
              {apiServices.filter(service => !service.required).map((service) => (
                <Card key={service.id} className="bg-background/30 border-border/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>API Klíč</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={service.placeholder}
                          value={config[service.id as keyof ApiConfig] as string}
                          onChange={(e) => handleKeyChange(service.id, e.target.value)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => validateApiKey(service.id, config[service.id as keyof ApiConfig] as string)}
                          disabled={isValidating || !config[service.id as keyof ApiConfig]}
                        >
                          {getStatusIcon(keyStatus[service.id]?.status)}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4 border-t border-border/30">
            <Button variant="outline" onClick={onClose}>
              Zrušit
            </Button>
            <Button onClick={handleSave} className="bg-gradient-primary">
              <Save className="h-4 w-4 mr-2" />
              Uložit konfiguraci
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};