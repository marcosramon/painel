import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

// 1. FIREBASE CORE & REAL-TIME
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

// 2. CONFIGURAÇÃO DO FIREBASE (SUBSTITUA PELAS SUAS CHAVES AQUI)
const firebaseConfig = {
  apiKey: 'AIzaSyDXVxk8FFegjUyVElsU8ATuxcgXSsleroo',
  authDomain: 'app-fic-ia.firebaseapp.com',
  projectId: 'app-fic-ia',
  storageBucket: 'app-fic-ia.firebasestorage.app',
  messagingSenderId: '555142642238',
  appId: '1:555142642238:web:fafdbf0dcb28c7ddd2af6f',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- UTILITÁRIOS PARA NUVEM DE PALAVRAS ---
const STOP_WORDS = new Set(["a,o,e,de,do,da,dos,das,em,no,na,nos,nas,um,uma,uns,umas,que,para,com,por,como,mais,mas,ao,aos,ou,se,seu,sua,seus,suas,não,muito,já,também,só,sobre,entre,até,pela,pelo,pelos,pelas,quando,onde,quem,qual,quais,todo,toda,todos,todas,cada,bem,ainda,mesmo,assim,então,depois,antes,aqui,ali,lá,sempre,nunca,agora,durante,através,esse,essa,esses,essas,este,esta,estes,estas,isso,isto,aquilo,ele,ela,eles,elas,nós,nos,me,meu,minha,meus,minhas,te,ti,teu,tua,teus,tuas,si,lhe,lhes,desse,dessa,desses,dessas,deste,desta,destes,destas,nesse,nessa,nesses,nessas,neste,nesta,nestes,nestas,dele,dela,deles,delas,nele,nela,neles,nelas,num,numa,nuns,numas,outro,outra,outros,outras,ser,estar,ter,haver,fazer,ir,vir,poder,dever,querer,saber,ver,dar,dizer,ficar,passar,tomar,curso,disciplina,aula,professor,estudante,expectativa,aprender,conhecimento,inteligência,artificial,educação,profissional"].join(",").split(","));

function generateWordCloud(texts: string[]) {
  const freq: Record<string, number> = {};
  texts.forEach(text => {
    text.toLowerCase()
      .replace(/[.,;:!?()""-]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w))
      .forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word, count]) => ({ word, count }));
}

const BRAZILIAN_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO","Exterior"];

// --- TEMAS E CORES ---
const COLORS = {
  primary: "#0f4c81", // Azul IFB
  secondary: "#1a6fb5",
  accent: "#22c55e", // Verde para destaque
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#1e293b",
  muted: "#64748b",
  chart: ["#0f4c81", "#1a6fb5", "#2d8fd5", "#5eaee0", "#8fc9eb", "#b8daf0"]
};

// --- COMPONENTES AUXILIARES ---
const Card = ({ title, children, fullWidth = false }: any) => (
  <div style={{
    background: COLORS.card,
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gridColumn: fullWidth ? "1 / -1" : "span 1",
    minHeight: "350px"
  }}>
    <h3 style={{ fontSize: "14px", fontWeight: 600, color: COLORS.primary, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
    <div style={{ flex: 1, width: "100%" }}>{children}</div>
  </div>
);

export default function App() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("form");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Estados do formulário
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [formacao, setFormacao] = useState("");
  const [profissao, setProfissao] = useState("");
  const [expectativas, setExpectativas] = useState("");

  // 3. EFEITO DE TEMPO REAL (Wow Factor)
  useEffect(() => {
    const q = query(collection(db, "apresentacoes"), orderBy("ts", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setEntries(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !cidade || !estado || !formacao || !profissao || !expectativas) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, "apresentacoes"), {
        nome, cidade, estado, formacao, profissao, expectativas, ts: Date.now()
      });
      setSubmitted(true);
    } catch (err) {
      alert("Erro ao enviar. Verifique sua conexão.");
    }
    setSubmitting(false);
  };

  // --- PROCESSAMENTO DE DADOS ---
  const stats = useMemo(() => {
    const states: any = {};
    const formations: any = {};
    const jobs: any = {};
    
    entries.forEach(e => {
      states[e.estado] = (states[e.estado] || 0) + 1;
      const f = e.formacao.trim().toUpperCase();
      formations[f] = (formations[f] || 0) + 1;
      const p = e.profissao.trim().toUpperCase();
      jobs[p] = (jobs[p] || 0) + 1;
    });

    return {
      states: Object.entries(states).map(([name, value]) => ({ name, value })).sort((a, b) => (b.value as any) - (a.value as any)),
      formations: Object.entries(formations).map(([name, value]) => ({ name, value })).sort((a, b) => (b.value as any) - (a.value as any)).slice(0, 5),
      jobs: Object.entries(jobs).map(([name, value]) => ({ name, value })).sort((a, b) => (b.value as any) - (a.value as any)).slice(0, 5),
      words: generateWordCloud(entries.map(e => e.expectativas))
    };
  }, [entries]);

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ border: "4px solid #f3f3f3", borderTop: "4px solid " + COLORS.primary, borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
        <p style={{ color: COLORS.muted }}>Carregando painel da turma...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.text }}>
      
      {/* HEADER PROFISSIONAL COM LOGO */}
      <header style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #061e33 100%)`, color: "white", padding: "40px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "30px", flexWrap: "wrap" }}>
          <img src="/painel/logo-ifb.png" alt="IFB Logo" style={{ height: "80px", objectFit: "contain" }} />
          <div style={{ flex: 1, minWidth: "300px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>Aplicações da Inteligência Artificial na Educação Profissional</h1>
            <p style={{ opacity: 0.8, fontSize: "16px", marginTop: "8px" }}>Prof. Dr. Marcos Ramon | Mapeamento da Turma</p>
          </div>
        </div>
      </header>

      {/* NAVEGAÇÃO */}
      <nav style={{ background: "white", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex" }}>
          <button onClick={() => setView("form")} style={{ flex: 1, padding: "20px", border: "none", background: "none", borderBottom: view === "form" ? "3px solid " + COLORS.accent : "none", color: view === "form" ? COLORS.primary : COLORS.muted, fontWeight: 600, cursor: "pointer" }}>FORMULÁRIO</button>
          <button onClick={() => setView("results")} style={{ flex: 1, padding: "20px", border: "none", background: "none", borderBottom: view === "results" ? "3px solid " + COLORS.accent : "none", color: view === "results" ? COLORS.primary : COLORS.muted, fontWeight: 600, cursor: "pointer" }}>RESULTADOS AO VIVO ({entries.length})</button>
        </div>
      </nav>

      <main style={{ maxWidth: view === "form" ? "640px" : "1200px", margin: "40px auto", padding: "0 20px" }}>
        
        {/* VISTA: FORMULÁRIO */}
        {view === "form" && (
          <div style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: "60px", marginBottom: "20px" }}>✅</div>
                <h2 style={{ color: COLORS.primary }}>Apresentação Enviada!</h2>
                <p style={{ color: COLORS.muted, marginBottom: "30px" }}>Obrigado por participar. Agora veja quem mais está no curso.</p>
                <button onClick={() => setView("results")} style={{ background: COLORS.primary, color: "white", border: "none", padding: "12px 30px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Ver Resultados</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 600 }}>Nome Completo</label>
                  <input required value={nome} onChange={e => setNome(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }} />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 600 }}>Cidade</label>
                    <input required value={cidade} onChange={e => setCidade(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 600 }}>Estado</label>
                    <select required value={estado} onChange={e => setEstado(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                      <option value="">Selecione</option>
                      {BRAZILIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 600 }}>Formação</label>
                    <input required value={formacao} onChange={e => setFormacao(e.target.value)} placeholder="Ex: Pedagogia" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 600 }}>Profissão</label>
                    <input required value={profissao} onChange={e => setProfissao(e.target.value)} placeholder="Ex: Professor" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 600 }}>Expectativas</label>
                  <textarea required value={expectativas} onChange={e => setExpectativas(e.target.value)} rows={4} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", resize: "none" }} placeholder="O que você espera aprender e como pretende aplicar a IA?" />
                </div>

                <button type="submit" disabled={submitting} style={{ background: COLORS.primary, color: "white", padding: "16px", borderRadius: "8px", border: "none", fontWeight: 700, cursor: "pointer", marginTop: "10px" }}>{submitting ? "ENVIANDO..." : "ENVIAR APRESENTAÇÃO"}</button>
              </form>
            )}
          </div>
        )}

        {/* VISTA: RESULTADOS AO VIVO */}
        {view === "results" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "30px" }}>
            
            <Card title="Origem dos Estudantes (Estados)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.states} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={40} style={{ fontSize: "12px", fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Principais Áreas de Formação">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={stats.formations} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {stats.formations.map((_, i) => <Cell key={i} fill={COLORS.chart[i % COLORS.chart.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Perfil Profissional">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.jobs}>
                  <XAxis dataKey="name" style={{ fontSize: "10px" }} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Nuvem de Expectativas (Palavras-chave)" fullWidth>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center", padding: "20px" }}>
                {stats.words.map((w, i) => (
                  <span key={i} style={{ 
                    fontSize: `${Math.max(14, Math.min(48, 14 + w.count * 8))}px`, 
                    color: i % 2 === 0 ? COLORS.primary : COLORS.secondary,
                    fontWeight: w.count > 1 ? "bold" : "normal",
                    opacity: 0.6 + (w.count * 0.1)
                  }}>
                    {w.word}
                  </span>
                ))}
                {stats.words.length === 0 && <p style={{ color: COLORS.muted }}>Aguardando mais respostas...</p>}
              </div>
            </Card>

          </div>
        )}
      </main>

      <footer style={{ textAlign: "center", padding: "60px 20px", color: COLORS.muted, fontSize: "13px" }}>
        Desenvolvido com IA | IFB Campus Brasília | 2024
      </footer>
    </div>
  );
}
