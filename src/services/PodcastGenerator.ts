import { ApiConfig } from "@/components/ApiConfiguration";
import { toast } from "sonner";

export interface PodcastTopic {
  title: string;
  description: string;
  source: string;
  url: string;
  relevanceScore: number;
}

export interface PersonaTopics {
  persona: string;
  topics: PodcastTopic[];
}

export interface PodcastScript {
  segments: ScriptSegment[];
  metadata: {
    totalDuration: number;
    wordCount: number;
    participantCount: number;
  };
}

export interface ScriptSegment {
  speaker: "petr" | "lubo" | "jarda" | "narrator";
  text: string;
  duration: number;
  type: "dialog" | "intro" | "outro" | "transition";
}

export interface GeneratedPodcast {
  id: string;
  title: string;
  script: PodcastScript;
  audioUrl?: string;
  topics: PersonaTopics[];
  duration: number;
  createdAt: Date;
  status: "generating" | "completed" | "error";
}

export class PodcastGenerator {
  private config: ApiConfig | null = null;
  private isGenerating = false;

  constructor(config?: ApiConfig) {
    this.config = config || null;
  }

  setConfig(config: ApiConfig) {
    this.config = config;
  }

  async generateWeeklyPodcast(
    onProgress?: (step: string, progress: number) => void
  ): Promise<GeneratedPodcast> {
    if (!this.config) {
      throw new Error("API konfigurace není nastavena");
    }

    if (this.isGenerating) {
      throw new Error("Generování již probíhá");
    }

    this.isGenerating = true;
    const podcastId = crypto.randomUUID();
    
    try {
      onProgress?.("Sbírám novinky z online zdrojů", 10);
      const topics = await this.collectTopics();
      
      onProgress?.("Analyzuji a vybírám top témata", 30);
      const selectedTopics = await this.selectTopTopics(topics);
      
      onProgress?.("Generuji scénář podcastu", 50);
      const script = await this.generateScript(selectedTopics);
      
      onProgress?.("Vytvářím AI hlasy", 70);
      const audioUrl = await this.generateAudio(script);
      
      onProgress?.("Finalizuji podcast", 90);
      
      const podcast: GeneratedPodcast = {
        id: podcastId,
        title: this.generateEpisodeTitle(selectedTopics),
        script,
        audioUrl,
        topics: selectedTopics,
        duration: script.metadata.totalDuration,
        createdAt: new Date(),
        status: "completed"
      };

      onProgress?.("Hotovo!", 100);
      
      // Uložit do localStorage pro demo
      this.savePodcastToStorage(podcast);
      
      return podcast;
      
    } catch (error) {
      console.error("Chyba při generování podcastu:", error);
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  private async collectTopics(): Promise<PodcastTopic[]> {
    // Simulujeme sběr novinek - v reálné aplikaci by se připojovalo k API
    await this.delay(2000);
    
    const mockTopics: PodcastTopic[] = [
      {
        title: "OpenAI představila GPT-4 Vision",
        description: "Nová multimodální schopnost zpracování obrazu a textu",
        source: "TechCrunch",
        url: "https://techcrunch.com/gpt4-vision",
        relevanceScore: 0.95
      },
      {
        title: "GitHub Copilot X s chat funkcionalitou",
        description: "AI asistent přímo v editoru s konverzačním rozhraním",
        source: "GitHub Blog", 
        url: "https://github.blog/copilot-x",
        relevanceScore: 0.88
      },
      {
        title: "Meta uvádí Llama 2 open source model",
        description: "Konkurence ChatGPT dostupná zdarma pro vývojáře",
        source: "Meta AI",
        url: "https://ai.meta.com/llama",
        relevanceScore: 0.92
      },
      {
        title: "Apple Vision Pro: AR/VR revoluce?",
        description: "První hands-on recenze a praktické využití",
        source: "Product Hunt",
        url: "https://producthunt.com/vision-pro",
        relevanceScore: 0.78
      },
      {
        title: "Quantum computing breakthrough IBM",
        description: "1000-qubit procesor a praktické aplikace",
        source: "ArXiv",
        url: "https://arxiv.org/quantum-2024",
        relevanceScore: 0.85
      }
    ];

    return mockTopics;
  }

  private async selectTopTopics(topics: PodcastTopic[]): Promise<PersonaTopics[]> {
    await this.delay(1500);
    
    // Rozdělení témat podle person
    const sortedTopics = topics.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return [
      {
        persona: "petr",
        topics: [
          sortedTopics[0], // GPT-4 Vision - makro trend
          sortedTopics[4]  // Quantum computing - budoucnost
        ]
      },
      {
        persona: "lubo", 
        topics: [
          sortedTopics[1], // GitHub Copilot - technický
          sortedTopics[2]  // Llama 2 - open source
        ]
      },
      {
        persona: "jarda",
        topics: [
          sortedTopics[3]  // Vision Pro - UX/produkt
        ]
      }
    ];
  }

  private async generateScript(topics: PersonaTopics[]): Promise<PodcastScript> {
    if (!this.config?.openai) {
      throw new Error("OpenAI API klíč není nastaven");
    }

    try {
      const prompt = this.buildScriptPrompt(topics);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Jsi expert na tvorbu tech podcastů. Vytvoř přirozený, zajímavý dialog mezi třemi českými tech specialisty.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 3000,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API chyba: ${response.statusText}`);
      }

      const data = await response.json();
      const scriptText = data.choices[0].message.content;
      
      return this.parseGeneratedScript(scriptText);
      
    } catch (error) {
      console.error('Chyba při generování scénáře:', error);
      // Fallback na mock script
      return this.getMockScript(topics);
    }
  }

  private buildScriptPrompt(topics: PersonaTopics[]): string {
    const topicList = topics.map(pt => 
      `${pt.persona}: ${pt.topics.map(t => t.title).join(', ')}`
    ).join('\n');
    
    return `
Vytvoř 15-20 minutový dialog pro tech podcast mezi:
- Petr Mára (analytik trendů) - makro pohled, budoucnost
- Lubo Smid (technický expert) - detaily, implementace 
- Jarda Beck (UX/produkt) - praktické využití, uživatele

Témata:
${topicList}

Formát:
**[úvod/přechod/outro]**
**Jméno:** text...

Požadavky:
- Přirozený český dialog
- Vtipné poznámky
- Technické detaily vysvětlené jednoduše
- 2500-3000 slov celkem
`;
  }

  private parseGeneratedScript(scriptText: string): PodcastScript {
    // Parsování OpenAI výstupu do segments
    const lines = scriptText.split('\n').filter(line => line.trim());
    const segments: ScriptSegment[] = [];
    
    let currentSpeaker: any = null;
    let currentText = '';
    
    for (const line of lines) {
      if (line.includes('**[') && line.includes(']**')) {
        // Sound effect nebo akce
        if (currentSpeaker && currentText) {
          segments.push({
            speaker: currentSpeaker,
            text: currentText.trim(),
            duration: this.estimateSegmentDuration(currentText),
            type: 'dialog'
          });
          currentText = '';
        }
      } else if (line.includes('**') && line.includes(':**')) {
        // Nový mluvčí
        if (currentSpeaker && currentText) {
          segments.push({
            speaker: currentSpeaker,
            text: currentText.trim(),
            duration: this.estimateSegmentDuration(currentText),
            type: 'dialog'
          });
        }
        
        const match = line.match(/\*\*(\w+):\*\* (.+)/);
        if (match) {
          const speakerName = match[1].toLowerCase();
          currentSpeaker = this.mapSpeakerName(speakerName);
          currentText = match[2];
        }
      } else if (currentSpeaker && line.trim()) {
        currentText += ' ' + line.trim();
      }
    }
    
    // Poslední segment
    if (currentSpeaker && currentText) {
      segments.push({
        speaker: currentSpeaker,
        text: currentText.trim(),
        duration: this.estimateSegmentDuration(currentText),
        type: 'dialog'
      });
    }
    
    return {
      segments,
      metadata: {
        totalDuration: segments.reduce((sum, seg) => sum + seg.duration, 0),
        wordCount: segments.reduce((sum, seg) => sum + seg.text.split(' ').length, 0),
        participantCount: 3
      }
    };
  }

  private mapSpeakerName(name: string): "petr" | "lubo" | "jarda" | "narrator" {
    const mapping: Record<string, "petr" | "lubo" | "jarda" | "narrator"> = {
      'petr': 'petr',
      'lubo': 'lubo', 
      'jarda': 'jarda',
      'mára': 'petr',
      'smid': 'lubo',
      'beck': 'jarda'
    };
    return mapping[name] || 'narrator';
  }

  private estimateSegmentDuration(text: string): number {
    // Průměrně 150 slov za minutu = 2.5 slova za sekundu
    const words = text.split(' ').length;
    return Math.round(words / 2.5);
  }

  private getMockScript(topics: PersonaTopics[]): PodcastScript {
    
    // Mock script generation - v reálné aplikaci by se volalo OpenAI API
    const segments: ScriptSegment[] = [
      {
        speaker: "narrator",
        text: "Vítejte u Tech Trendy podcastu! Dnes s vámi budou hovořit Petr Mára, Lubo Smid a Jarda Beck o nejnovějších technologických trendech.",
        duration: 8,
        type: "intro"
      },
      {
        speaker: "petr",
        text: "Ahoj všem! Dnes jsem připravil zajímavá témata o GPT-4 Vision a kvantových počítačích. OpenAI skutečně posunulo hranice s multimodálními schopnostmi.",
        duration: 12,
        type: "dialog"
      },
      {
        speaker: "lubo",
        text: "Super téma, Petře! Já se zaměřím na GitHub Copilot X a Meta Llama 2. Tyto nástroje mění způsob, jak programujeme.",
        duration: 10,
        type: "dialog"
      },
      {
        speaker: "jarda",
        text: "A já vám povím o praktických dopadech Apple Vision Pro. Jak to změní uživatelské rozhraní budoucnosti?",
        duration: 9,
        type: "dialog"
      },
      {
        speaker: "petr",
        text: "Začněme s GPT-4 Vision. Co mě fascinuje je, že můžete nahrát obrázek a AI vám ho detailně popíše, analyzuje nebo dokonce vytvoří kód na základě nákresu UI.",
        duration: 15,
        type: "dialog"
      },
      {
        speaker: "lubo",
        text: "To je přesně to, co vidím u GitHub Copilot X. Můžete se zeptat 'jak funguje tenhle kód?' a AI vám to vysvětlí v kontextu celého projektu.",
        duration: 12,
        type: "dialog"
      },
      {
        speaker: "jarda", 
        text: "Z UX pohledu je to revoluce. Vision Pro ukazuje, jak by mohly vypadat interfaces, kde nepotřebujete obrazovku - všechno je kolem vás.",
        duration: 11,
        type: "dialog"
      },
      {
        speaker: "petr",
        text: "A kvantové počítače od IBM? 1000 qubitů je pořád daleko od praktického využití, ale směr je jasný.",
        duration: 10,
        type: "dialog"
      },
      {
        speaker: "lubo",
        text: "Meta s Llama 2 ukázala, že open source AI může konkurovat komerčním řešením. To je pro vývojáře skvělá zpráva.",
        duration: 12,
        type: "dialog"
      },
      {
        speaker: "narrator",
        text: "To bylo vše pro dnešní díl Tech Trendů. Děkujeme za poslech a těšíme se na vás příště!",
        duration: 7,
        type: "outro"
      }
    ];

    return {
      segments,
      metadata: {
        totalDuration: segments.reduce((sum, seg) => sum + seg.duration, 0),
        wordCount: segments.reduce((sum, seg) => sum + seg.text.split(' ').length, 0),
        participantCount: 3
      }
    };
  }

  private async generateAudio(script: PodcastScript): Promise<string> {
    if (!this.config?.elevenLabs) {
      throw new Error("ElevenLabs API klíč není nastaven");
    }

    try {
      const voiceMap = {
        petr: 'Rachel', // můžete změnit na konkrétní voice ID
        lubo: 'Josh',
        jarda: 'Bella',
        narrator: 'Rachel'
      };

      const audioSegments: string[] = [];
      
      for (const segment of script.segments) {
        if (segment.speaker === 'narrator' || segment.text.length < 10) {
          continue; // Přeskočit krátké segmenty
        }

        const voiceId = voiceMap[segment.speaker];
        
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.config.elevenLabs,
          },
          body: JSON.stringify({
            text: segment.text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.75,
              similarity_boost: 0.85,
              style: 0.5,
              use_speaker_boost: true
            }
          })
        });

        if (!response.ok) {
          console.warn(`ElevenLabs API chyba pro segment: ${response.statusText}`);
          continue;
        }

        // V reálné aplikaci byste zde zpracovali audio data
        // Pro demo jen simulujeme
        audioSegments.push(`segment_${segment.speaker}_${Date.now()}.mp3`);
      }
      
      // Simulace spojení audio segmentů
      return `https://generated-podcast-${Date.now()}.mp3`;
      
    } catch (error) {
      console.error('Chyba při generování audio:', error);
      // Fallback - vrátit mock URL
      return `https://mock-podcast-${Date.now()}.mp3`;
    }
  }

  private generateEpisodeTitle(topics: PersonaTopics[]): string {
    const allTopics = topics.flatMap(pt => pt.topics);
    const mainTopic = allTopics[0];
    return `Tech Trendy #${Date.now()}: ${mainTopic.title} a další novinky`;
  }

  private savePodcastToStorage(podcast: GeneratedPodcast) {
    const existingPodcasts = this.getAllPodcasts();
    existingPodcasts.unshift(podcast);
    localStorage.setItem('generatedPodcasts', JSON.stringify(existingPodcasts.slice(0, 20)));
  }

  getAllPodcasts(): GeneratedPodcast[] {
    try {
      const stored = localStorage.getItem('generatedPodcasts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}