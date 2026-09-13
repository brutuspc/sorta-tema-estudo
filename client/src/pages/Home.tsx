import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Flame,
  Hash,
  History,
  Lightbulb,
  RotateCw,
  Search,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";

type Topic = {
  id: number;
  title: string;
  area: string;
  mode: string;
  difficulty: "Tranquilo" | "Puxado" | "Desafio";
  prompt: string;
  seed: string;
};

type HistoryItem = Topic & { drawnAt: string };

const STORAGE_KEY = "solta-o-verbo-historico-v1";
const FAVORITES_KEY = "solta-o-verbo-favoritos-v1";

const topics: Topic[] = [
  ["IA na educação: ferramenta ou atalho?", "Tecnologia", "Opinião", "Puxado", "A inteligência artificial está mudando a forma como aprendemos. Defenda uma tese sobre seus impactos na autonomia dos estudantes.", "autonomia"],
  ["O direito ao silêncio nas cidades", "Sociedade", "Dissertação", "Tranquilo", "Grandes centros são cada vez mais barulhentos. Explique por que o silêncio também pode ser entendido como um direito coletivo.", "cidade"],
  ["A memória de um país também se constrói", "História", "Explicação", "Puxado", "Escolha um acontecimento histórico e mostre como diferentes narrativas podem mudar a leitura que fazemos dele.", "memória"],
  ["Comer é um ato político?", "Cultura", "Opinião", "Desafio", "Investigue como hábitos alimentares, preço e acesso revelam desigualdades e identidades sociais.", "comida"],
  ["O futuro do trabalho é humano?", "Tecnologia", "Debate", "Desafio", "Compare automação e criatividade humana. Que habilidades deveriam ser prioridade na formação profissional?", "trabalho"],
  ["A solidão na era da conexão", "Comportamento", "Dissertação", "Tranquilo", "Redes sociais aproximam ou aprofundam o isolamento? Construa uma análise com exemplos do cotidiano.", "conexão"],
  ["Água: recurso natural ou bem comum?", "Meio ambiente", "Explicação", "Puxado", "Explique os conflitos envolvidos no uso da água e proponha uma forma de equilibrar consumo, produção e preservação.", "água"],
  ["O que torna uma obra inesquecível?", "Arte", "Opinião", "Desafio", "Defina os elementos que fazem uma obra atravessar gerações, usando pelo menos uma referência artística.", "arte"],
  ["Privacidade vale menos que conveniência?", "Tecnologia", "Debate", "Puxado", "Avalie o preço invisível de aplicativos e serviços que coletam nossos dados em troca de praticidade.", "privacidade"],
  ["A escola prepara para a vida real?", "Educação", "Opinião", "Tranquilo", "Reflita sobre o que deveria ser ensinado na escola e o que ainda fica de fora da formação dos jovens.", "escola"],
  ["Quando uma regra deixa de ser justa?", "Filosofia", "Debate", "Desafio", "Diferencie obediência, ética e responsabilidade a partir de um dilema do cotidiano.", "ética"],
  ["Turismo: encontro ou consumo de lugares?", "Geografia", "Dissertação", "Puxado", "Analise como o turismo transforma territórios e discuta caminhos para uma experiência menos predatória.", "turismo"],
  ["A linguagem muda o mundo?", "Linguagem", "Explicação", "Desafio", "Mostre como palavras, sotaques e escolhas linguísticas podem incluir, excluir ou disputar poder.", "linguagem"],
  ["O que perdemos quando tudo vira conteúdo?", "Mídia", "Opinião", "Puxado", "Reflita sobre a transformação de experiências íntimas, notícias e relações em produtos para audiência.", "conteúdo"],
  ["Pequenas escolhas podem frear a crise climática?", "Meio ambiente", "Dissertação", "Tranquilo", "Compare responsabilidade individual e responsabilidade de empresas e governos na crise climática.", "clima"],
  ["A cidade ideal existe?", "Arquitetura", "Debate", "Desafio", "Desenhe em palavras uma cidade que concilie mobilidade, beleza, segurança e convivência.", "cidade"],
  ["A coragem de mudar de opinião", "Comportamento", "Opinião", "Tranquilo", "Explique por que mudar de ideia pode ser sinal de força — e não de fraqueza.", "coragem"],
  ["Esporte é cultura?", "Cultura", "Explicação", "Tranquilo", "Mostre como práticas esportivas constroem pertencimento, memória e identidade coletiva.", "esporte"],
  ["Quem tem acesso ao tempo livre?", "Sociedade", "Dissertação", "Desafio", "Analise o lazer como marcador de classe, gênero e território.", "tempo"],
  ["O humor tem limites?", "Filosofia", "Debate", "Puxado", "Discuta a tensão entre liberdade de expressão, intenção humorística e efeitos sobre grupos vulneráveis.", "humor"],
  ["A ciência precisa ser compreendida por todos?", "Ciência", "Opinião", "Tranquilo", "Defenda a importância — ou os limites — da divulgação científica na democracia.", "ciência"],
  ["O livro ainda é uma tecnologia revolucionária", "Literatura", "Explicação", "Tranquilo", "Escolha um livro que alterou sua forma de ver o mundo e explique como isso aconteceu.", "livro"],
  ["A beleza pode ser uma forma de poder", "Arte", "Dissertação", "Desafio", "Analise como padrões de beleza são criados, vendidos e contestados.", "beleza"],
  ["O que faz uma comunidade?", "Sociedade", "Opinião", "Puxado", "Compare comunidade presencial, comunidade online e comunidade imaginada.", "comunidade"],
  ["A nostalgia nos protege ou nos engana?", "Comportamento", "Explicação", "Tranquilo", "Investigue o papel da nostalgia nas escolhas pessoais e na cultura popular.", "nostalgia"],
  ["Liberdade de escolha em um mundo de algoritmos", "Tecnologia", "Debate", "Desafio", "Se plataformas antecipam nossos desejos, quanto ainda há de escolha genuína?", "algoritmo"],
  ["O preço de uma vida sustentável", "Economia", "Dissertação", "Puxado", "Discuta se sustentabilidade pode ser individual sem políticas públicas que tornem escolhas verdes acessíveis.", "sustentabilidade"],
  ["A pressa é uma virtude?", "Filosofia", "Opinião", "Tranquilo", "Defenda uma posição sobre velocidade, produtividade e qualidade de vida.", "pressa"],
  ["O que os mapas escondem?", "Geografia", "Explicação", "Desafio", "Mostre como mapas também expressam escolhas, interesses e relações de poder.", "mapas"],
  ["A música conta histórias que a fala não conta", "Música", "Opinião", "Tranquilo", "Escolha uma canção e explique que memória, conflito ou experiência ela torna visível.", "música"],
  ["Educar é transmitir ou provocar?", "Educação", "Debate", "Desafio", "Compare modelos de ensino baseados em conteúdo, diálogo, disciplina e descoberta.", "ensino"],
  ["A tecnologia aproxima o interior e a capital?", "Brasil", "Dissertação", "Puxado", "Analise como conectividade e infraestrutura transformam — ou não — desigualdades territoriais brasileiras.", "território"],
  ["Cuidar também é produzir", "Economia", "Explicação", "Desafio", "Mostre por que o trabalho de cuidado precisa ser reconhecido nas discussões sobre economia.", "cuidado"],
  ["A identidade é descoberta ou inventada?", "Filosofia", "Opinião", "Desafio", "Construa uma reflexão sobre as forças que participam da formação de quem somos.", "identidade"],
  ["O que uma fotografia não mostra?", "Arte", "Explicação", "Puxado", "Escolha uma imagem e explore as ausências, escolhas e enquadramentos que produzem seu sentido.", "fotografia"],
  ["Consumir menos é viver melhor?", "Economia", "Dissertação", "Tranquilo", "Discuta minimalismo, publicidade e a promessa de felicidade pelo consumo.", "consumo"],
  ["A democracia acontece entre eleições", "Política", "Opinião", "Puxado", "Explique quais práticas cotidianas fortalecem ou enfraquecem uma cultura democrática.", "democracia"],
  ["A infância precisa de mais tédio", "Educação", "Debate", "Tranquilo", "Reflita sobre criatividade, telas, agenda cheia e o valor de não fazer nada.", "infância"],
  ["O patrimônio pertence a quem?", "História", "Dissertação", "Desafio", "Analise disputas em torno da preservação de prédios, festas, objetos e memórias.", "patrimônio"],
  ["A dúvida pode ser produtiva", "Ciência", "Explicação", "Tranquilo", "Mostre como questionar certezas pode gerar conhecimento e decisões melhores.", "dúvida"],
  ["Como seria uma internet mais gentil?", "Mídia", "Opinião", "Puxado", "Proponha princípios de convivência digital que não dependam apenas de boas intenções.", "gentileza"],
].map(([title, area, mode, difficulty, prompt, seed], index) => ({ id: index + 1, title, area, mode, difficulty: difficulty as Topic["difficulty"], prompt, seed }));

const areas = ["Todas", ...Array.from(new Set(topics.map((topic) => topic.area)))];
const modes = ["Todos", ...Array.from(new Set(topics.map((topic) => topic.mode)))];

function readHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function readFavorites(): number[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [area, setArea] = useState("Todas");
  const [mode, setMode] = useState("Todos");
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState<Topic>(topics[0]);
  const [history, setHistory] = useState<HistoryItem[]>(readHistory);
  const [favorites, setFavorites] = useState<number[]>(readFavorites);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const filteredTopics = useMemo(() => topics.filter((topic) => {
    const matchesArea = area === "Todas" || topic.area === area;
    const matchesMode = mode === "Todos" || topic.mode === mode;
    const matchesQuery = !query || `${topic.title} ${topic.area} ${topic.prompt}`.toLowerCase().includes(query.toLowerCase());
    return matchesArea && matchesMode && matchesQuery;
  }), [area, mode, query]);

  const drawTopic = () => {
    const pool = filteredTopics.length ? filteredTopics : topics;
    const candidates = pool.filter((topic) => topic.id !== current.id);
    const next = (candidates.length ? candidates : pool)[Math.floor(Math.random() * (candidates.length ? candidates.length : pool.length))];
    setIsRolling(true);
    window.setTimeout(() => {
      setCurrent(next);
      setHistory((items) => [{ ...next, drawnAt: new Date().toISOString() }, ...items.filter((item) => item.id !== next.id)].slice(0, 30));
      setIsRolling(false);
    }, 240);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && event.target instanceof HTMLElement && !["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) {
        event.preventDefault();
        drawTopic();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const toggleFavorite = () => setFavorites((items) => items.includes(current.id) ? items.filter((id) => id !== current.id) : [current.id, ...items]);

  const copyTopic = async () => {
    await navigator.clipboard?.writeText(`${current.title}\n\n${current.prompt}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const clearHistory = () => setHistory([]);
  const restoreTopic = (item: HistoryItem) => {
    setCurrent(item);
    setShowHistory(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f3ed] text-[#16243a]">
      <div className="grain" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-10">
        <a href="#inicio" className="flex items-center gap-3" aria-label="Solta o Verbo início">
          <div className="brand-mark"><span>SV</span></div>
          <div><p className="font-display text-lg font-bold leading-none tracking-tight">solta o verbo</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#6d7890]">prática de ideias</p></div>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#5e6a7f] md:flex">
          <a href="#sortear" className="transition-colors hover:text-[#16243a]">Sortear</a>
          <button onClick={() => setShowHistory(true)} className="transition-colors hover:text-[#16243a]">Histórico <span className="ml-1 rounded-full bg-[#e5e9ef] px-2 py-0.5 text-xs">{history.length}</span></button>
          <a href="#como-funciona" className="transition-colors hover:text-[#16243a]">Como funciona</a>
        </nav>
        <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 rounded-full border border-[#d9d9d2] bg-white/70 px-3 py-2 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 md:hidden"><History size={16} /> Histórico</button>
      </header>

      <section id="inicio" className="relative mx-auto max-w-7xl px-5 pb-10 pt-10 md:px-10 md:pb-16 md:pt-16">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#f9bf9e]/45 blur-3xl" />
        <div className="relative grid items-end gap-10 lg:grid-cols-[1fr_0.78fr]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e4d9c9] bg-[#fffaf2] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#ba5e47]"><Sparkles size={14} /> um tema por vez</div>
            <h1 className="font-display text-[clamp(3.7rem,9vw,8rem)] font-black leading-[0.86] tracking-[-0.065em]">ideias que<br /><em className="text-[#e2694f]">puxam assunto.</em></h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#667188] md:text-xl">Sorteie um tema, organize suas ideias e descubra até onde sua opinião consegue ir.</p>
          </div>
          <div className="relative ml-auto max-w-sm rotate-2 rounded-[28px] border border-[#eadcc7] bg-[#fff9ed] p-6 shadow-[0_20px_55px_rgba(90,67,37,0.1)]">
            <div className="absolute -top-4 right-7 rotate-[-7deg] rounded-full bg-[#16243a] px-3 py-1.5 text-xs font-bold text-[#fff7e9]">sem resposta certa</div>
            <p className="font-display text-2xl font-bold leading-tight text-[#16243a]">"Toda boa ideia começa com uma pergunta que incomoda um pouquinho."</p>
            <div className="mt-5 flex items-center justify-between text-xs font-bold uppercase tracking-[0.15em] text-[#b78860]"><span>nota mental</span><span>01 / 40+</span></div>
          </div>
        </div>
      </section>

      <section id="sortear" className="relative z-10 mx-auto max-w-7xl px-5 pb-20 md:px-10">
        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.45fr]">
          <aside className="rounded-[28px] border border-[#e4e2dc] bg-white/75 p-5 shadow-[0_16px_45px_rgba(22,36,58,0.05)] backdrop-blur-sm md:p-6">
            <div className="mb-6 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#edf1f6] text-[#47627e]"><Search size={18} /></div><div><p className="font-display font-bold">afine o sorteio</p><p className="text-xs text-[#8b94a4]">ou deixe o acaso trabalhar</p></div></div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#7b8493]">buscar no repertório</label>
            <div className="relative mb-5"><Search className="absolute left-3 top-3.5 text-[#a1a9b5]" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ex.: tecnologia, cultura..." className="w-full rounded-2xl border border-[#e3e5e7] bg-[#fbfbfa] py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#e2694f] focus:ring-4 focus:ring-[#e2694f]/10" /></div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1"><Filter label="área" value={area} options={areas} onChange={setArea} /><Filter label="formato" value={mode} options={modes} onChange={setMode} /></div>
            <div className="my-6 h-px bg-[#ecece8]" />
            <div className="flex items-center justify-between text-sm"><span className="text-[#7d8797]">temas encontrados</span><strong className="font-display text-xl">{filteredTopics.length}</strong></div>
            <button onClick={() => { setArea("Todas"); setMode("Todos"); setQuery(""); }} className="mt-4 text-xs font-bold text-[#d56750] hover:underline">limpar filtros</button>
          </aside>

          <div className="relative overflow-hidden rounded-[32px] bg-[#16243a] p-6 text-[#fdf9f1] shadow-[0_22px_70px_rgba(22,36,58,0.2)] md:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-[#31445e]/80" /><div className="absolute bottom-[-100px] left-[18%] h-64 w-64 rounded-full border-[1px] border-[#31445e]" />
            <div className="relative flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9eafc4]"><WandSparkles size={15} className="text-[#f39b7e]" /> seu próximo assunto</div><span className="rounded-full border border-[#43556e] px-3 py-1 text-xs font-semibold text-[#b6c2d1]">{current.area}</span></div>
            <div className={`relative min-h-[255px] py-12 transition-all duration-200 ${isRolling ? "scale-[0.985] opacity-40" : "scale-100 opacity-100"}`}>
              <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#f39b7e]"><span className="h-2 w-2 rounded-full bg-[#f39b7e]" /> {current.mode} · {current.difficulty}</div>
              <h2 className="font-display max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] md:text-6xl">{current.title}</h2>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#c3cdda] md:text-lg">{current.prompt}</p>
            </div>
            <div className="relative flex flex-wrap items-center gap-3 border-t border-[#34455d] pt-5"><button onClick={drawTopic} disabled={isRolling} className="group flex items-center gap-2 rounded-full bg-[#e97659] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#e97659]/20 transition hover:-translate-y-0.5 hover:bg-[#f28568] active:scale-[0.97]"><RotateCw size={17} className={isRolling ? "animate-spin" : "transition-transform group-hover:rotate-180"} /> sortear outro <kbd className="ml-1 hidden rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold sm:inline">ESPAÇO</kbd></button><button onClick={toggleFavorite} className={`grid h-11 w-11 place-items-center rounded-full border transition hover:-translate-y-0.5 ${favorites.includes(current.id) ? "border-[#f39b7e] bg-[#f39b7e] text-white" : "border-[#536278] text-[#bdc8d7] hover:border-[#f39b7e] hover:text-[#f39b7e]"}`} aria-label="Favoritar tema"><Bookmark size={18} fill={favorites.includes(current.id) ? "currentColor" : "none"} /></button><button onClick={copyTopic} className="grid h-11 w-11 place-items-center rounded-full border border-[#536278] text-[#bdc8d7] transition hover:-translate-y-0.5 hover:border-[#f39b7e] hover:text-[#f39b7e]" aria-label="Copiar tema">{copied ? <Check size={18} /> : <Copy size={18} />}</button><span className="ml-auto hidden items-center gap-2 text-xs text-[#8291a6] md:flex"><Clock3 size={14} /> salvo automaticamente no histórico</span></div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-7xl px-5 pb-20 md:px-10"><div className="mb-7 flex items-end justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d26952]">um pequeno ritual</p><h2 className="font-display text-4xl font-black tracking-[-0.04em]">tire a ideia do papel</h2></div><div className="hidden text-right text-sm text-[#7d8797] md:block"><p>repertório vivo</p><p className="font-display text-2xl font-bold text-[#16243a]">{topics.length} temas e contando</p></div></div><div className="grid gap-4 md:grid-cols-3"><Step number="01" icon={<Hash size={18} />} title="sorteie" text="Deixe o acaso escolher uma provocação ou refine por área e formato." /><Step number="02" icon={<Lightbulb size={18} />} title="pense" text="Anote argumentos, referências, exemplos e perguntas que surgirem." /><Step number="03" icon={<Flame size={18} />} title="desenvolva" text="Explique em voz alta, escreva uma dissertação ou puxe uma conversa." /></div></section>

      {showHistory && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#16243a]/40 p-4 backdrop-blur-sm md:items-center"><div className="w-full max-w-xl rounded-[28px] bg-[#fffdf8] p-6 shadow-2xl md:p-8"><div className="mb-6 flex items-start justify-between"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#d26952]">memória de estudo</p><h3 className="font-display text-3xl font-black">histórico de temas</h3></div><button onClick={() => setShowHistory(false)} className="rounded-full bg-[#eef0f2] px-3 py-2 text-sm font-bold text-[#667188] hover:bg-[#e5e8eb]">fechar</button></div>{history.length === 0 ? <div className="rounded-2xl bg-[#f3f1ec] p-8 text-center text-sm text-[#7d8797]">Você ainda não sorteou nenhum tema. O próximo fica salvo aqui.</div> : <div className="max-h-[52vh] space-y-2 overflow-auto pr-1">{history.map((item) => <button key={`${item.id}-${item.drawnAt}`} onClick={() => restoreTopic(item)} className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-[#ece9e2] p-4 text-left transition hover:border-[#e2694f]/40 hover:bg-[#fff7ee]"><span><span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#d26952]">{item.area} · {item.mode}</span><strong className="font-display text-lg leading-tight">{item.title}</strong></span><ChevronDown className="-rotate-90 shrink-0 text-[#a1a9b5] transition group-hover:text-[#e2694f]" size={18} /></button>)}</div>}<div className="mt-6 flex items-center justify-between border-t border-[#ece9e2] pt-5"><span className="text-xs text-[#9299a4]">{history.length}/30 temas recentes</span><button onClick={clearHistory} disabled={!history.length} className="flex items-center gap-2 text-xs font-bold text-[#b45142] disabled:opacity-40"><Trash2 size={14} /> limpar histórico</button></div></div></div>}
      <footer className="border-t border-[#e6e1d8] px-5 py-8 text-center text-xs text-[#8b94a4] md:px-10"><span className="font-display font-bold text-[#16243a]">solta o verbo</span> · uma ideia puxa a outra.</footer>
    </main>
  );
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <div><label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#7b8493]">{label}</label><div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-2xl border border-[#e3e5e7] bg-[#fbfbfa] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#e2694f] focus:ring-4 focus:ring-[#e2694f]/10">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-[#9da5af]" size={16} /></div></div>;
}

function Step({ number, icon, title, text }: { number: string; icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-[24px] border border-[#e9e5de] bg-white/60 p-5"><div className="mb-8 flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf1f6] text-[#47627e]">{icon}</span><span className="font-display text-sm font-bold text-[#c3bdb2]">{number}</span></div><h3 className="font-display text-2xl font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#7d8797]">{text}</p></div>;
}

void topics;
