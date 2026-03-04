import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Treemap } from "recharts";

// 1. IMPORTAÇÕES DO FIREBASE
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";

// 2. CONFIGURAÇÃO DO FIREBASE
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

// ============================================================
// STOPWORDS — revisadas para manter termos relevantes ao curso
// ============================================================

const SW_GRAMATICAIS = "a,o,e,de,do,da,dos,das,em,no,na,nos,nas,um,uma,uns,umas,que,para,com,por,como,mais,mas,ao,aos,ou,se,seu,sua,seus,suas,não,muito,já,também,só,sobre,entre,até,pela,pelo,pelos,pelas,quando,onde,quem,qual,quais,todo,toda,todos,todas,cada,bem,ainda,mesmo,assim,então,depois,antes,aqui,ali,lá,sempre,nunca,agora,durante,através,esse,essa,esses,essas,este,esta,estes,estas,isso,isto,aquilo,ele,ela,eles,elas,nós,nos,me,meu,minha,meus,minhas,te,ti,teu,tua,teus,tuas,si,lhe,lhes,desse,dessa,desses,dessas,deste,desta,destes,destas,nesse,nessa,nesses,nessas,neste,nesta,nestes,nestas,dele,dela,deles,delas,nele,nela,neles,nelas,num,numa,nuns,numas,outro,outra,outros,outras,próprio,própria,próprios,próprias,algum,alguma,alguns,algumas,nenhum,nenhuma,nenhuns,nenhumas,tal,tais,tanto,tanta,tantos,tantas,quanto,quanta,quantos,quantas,porém,contudo,todavia,entretanto,portanto,pois,logo,porque,embora,enquanto,conforme,segundo,nem,ora,quer,seja,sequer,senão,apenas,inclusive,exceto,salvo,afinal,aliás,ademais,sobretudo,outrossim,tampouco,mim,comigo,contigo,consigo,conosco,convosco";

const SW_VERBOS = "ser,estar,ter,haver,fazer,ir,vir,poder,dever,querer,saber,ver,dar,dizer,ficar,passar,tomar,sou,és,foi,era,fui,são,somos,eram,será,seria,sendo,sido,estou,está,estão,estava,estavam,estive,esteve,estiveram,tenho,tem,temos,têm,tinha,tinham,tive,teve,tiveram,terá,teria,tendo,tido,hei,há,houve,havia,haviam,haverá,haveria,havendo,havido,faço,faz,fazem,fez,fizeram,fazia,faziam,fará,faria,fazendo,feito,vou,vai,vamos,vão,fui,foram,ia,iam,irá,iria,indo,ido,venho,vem,vêm,veio,vieram,vinha,vinham,virá,viria,vindo,posso,pode,podem,podia,podiam,pôde,puderam,poderá,poderia,podendo,podido,devo,deve,devem,devia,deviam,deverá,deveria,devendo,devido,quero,quer,querem,quis,quiseram,queria,queriam,querendo,querido,sei,sabe,sabem,sabia,sabiam,soube,souberam,saberá,saberia,sabendo,sabido,vejo,viu,viram,via,viam,verá,veria,vendo,visto,dou,deu,deram,dava,davam,dará,daria,dando,dado,digo,diz,dizem,disse,disseram,dizia,diziam,dirá,diria,dizendo,dito,fico,fica,ficam,ficou,ficaram,ficava,ficavam,ficará,ficaria,ficando,ficado,passo,passa,passam,passou,passaram,passava,passavam,passará,passaria,passando,passado,tomo,toma,tomam,tomou,tomaram,tomava,tomavam,tomará,tomaria,tomando,tomado,possa,possam,pudesse,pudessem,fosse,fossem,esteja,estejam,estivesse,estivessem,tenha,tenham,tivesse,tivessem,haja,hajam,houvesse,houvessem,faça,façam,fizesse,fizessem,vá,fosse,fossem,venha,venham,viesse,viessem,queira,queiram,quisesse,quisessem,saiba,saibam,soubesse,soubessem,veja,vejam,visse,vissem,dê,deem,dessem,diga,digam,dissesse,dissessem,fique,fiquem,ficasse,ficassem,pretendo,pretender,espero,esperar,gostaria,acredito,acreditar,penso,pensar,acho,conseguir,começar,continuar,tentar,ajudar,permitir,oferecer,apresentar,mostrar,trazer,levar,criar,proporcionar,promover,ampliar,aprimorar,aprofundar,explorar,descobrir,adquirir,compartilhar,trocar,buscar,obter,alcançar,atingir,realizar,participar,contribuir,desenvolver,aplicar,utilizar,conhecer,entender,compreender";

const SW_GENERICAS = "muito,muita,muitos,muitas,pouco,pouca,poucos,poucas,demais,bastante,tanto,tanta,tantos,tantas,mais,menos,maior,menor,melhor,pior,bom,boa,bons,boas,mau,mal,grande,grandes,pequeno,pequena,novo,nova,novos,novas,velho,velha,certo,certa,certos,certas,possível,possíveis,difícil,difíceis,fácil,fáceis,capaz,capazes,geral,gerais,real,reais,total,especial,principal,diferentes,diversas,diversos,determinado,determinada,respectivo,respectiva,somente,principalmente,realmente,certamente,provavelmente,simplesmente,especialmente,praticamente,normalmente,exatamente,basicamente,atualmente,geralmente,inicialmente,anteriormente,posteriormente,finalmente,eventualmente,coisa,coisas,algo,nada,tudo,parte,partes,forma,formas,modo,modos,tipo,tipos,vez,vezes,dia,dias,tempo,tempos,ano,anos,caso,casos,ponto,pontos,fato,fatos,lado,lados,lugar,lugares,exemplo,final,início,meio,conta,uso,jeito,questão,momento,sentido,razão,relação,maneira,situação,condição,processo,resultado,objetivo,ideia,base,área,campo,mundo,vida,pessoa,pessoas,grupo,grupos";

const SW_CONTEXTO = "curso,disciplina,aula,aulas,professor,professora,aluno,aluna,alunos,alunas,estudante,estudantes,atividade,atividades,conteúdo,conteúdos,material,materiais,módulo,módulos,turma,semestre,período,nota,notas,prova,provas,trabalho,trabalhos,aprendizado,aprendizagem,aprender,experiência,experiências,perspectiva,perspectivas,expectativa,expectativas,interesse,interesses,dentro,além,partir,respeito,referência,relativo,relativa";

const SW_INGLES = "the,and,to,of,in,for,is,that,with,this,was,are,be,have,has,had,not,but,what,all,were,when,can,there,from,will,would,could,should,been,being,their,them,they,which,about,into,more,some,than,its,also,just,other,any,only,very,how,our,out,these,those,after,before,between,through,during,each,both,such,then,because,since,while,where,most,much,many,even,still,over,own,here,does,did";

const STOP_WORDS = new Set(
  [SW_GRAMATICAIS, SW_VERBOS, SW_GENERICAS, SW_CONTEXTO, SW_INGLES]
    .join(",").split(",").map(w => w.trim()).filter(Boolean)
);

const BRAZILIAN_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI",
  "RJ","RN","RS","RO","RR","SC","SP","SE","TO","Exterior"
];

// ============================================================
// Tokenização — trata enclíticos (utilizá-la → utilizar)
// ============================================================

const ENCLITICS = new Set(["me","te","se","o","a","os","as","lo","la","los","las","lhe","lhes","nos","vos"]);

function cleanToken(raw: string): string {
  const parts = raw.split("-");
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    if (ENCLITICS.has(last)) {
      let stem = parts.slice(0, -1).join("-");
      if (stem.endsWith("á")) stem = stem.slice(0, -1) + "ar";
      else if (stem.endsWith("ê")) stem = stem.slice(0, -1) + "er";
      else if (stem.endsWith("í")) stem = stem.slice(0, -1) + "ir";
      return stem;
    }
  }
  return raw;
}

function generateWordCloud(texts: string[]) {
  const freq: Record<string, number> = {};
  texts.forEach(text => {
    text.toLowerCase()
      .replace(/[.,;:!?()"""''«»\/\\@#$%&*[\]{}|<>~^`+=_]/g, " ")
      .replace(/\s+/g, " ").trim().split(" ")
      .map(cleanToken)
      .filter(w => w.length >= 4 && !STOP_WORDS.has(w) && !/^\d+$/.test(w) && /[a-záàâãéèêíïóôõúüç]/.test(w))
      .forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  });
  const minFreq = texts.length > 50 ? 3 : texts.length > 15 ? 2 : 1;
  return Object.entries(freq)
    .filter(([_, count]) => count >= minFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word, count]) => ({ word, count }));
}

// ============================================================
// Helpers de dados
// ============================================================

function normalizeCategory(text: string): string {
  const s = text.trim();
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function aggregateWithOthers(data: {name:string,value:number}[], maxItems: number) {
  if (data.length <= maxItems) return data;
  const top = data.slice(0, maxItems - 1);
  const othersVal = data.slice(maxItems - 1).reduce((s, d) => s + d.value, 0);
  return [...top, { name: "Outros", value: othersVal }];
}

// ============================================================
// Theme
// ============================================================

const T = {
  blue900: "#0a2e4f", blue800: "#0d3a63", blue700: "#0f4c81", blue600: "#1a6fb5",
  blue500: "#2d8fd5", blue400: "#5eaee0", blue300: "#8fc9eb", blue200: "#b8daf0",
  blue100: "#e3eff8", blue50: "#f3f8fc", white: "#ffffff",
  gray600: "#5a6d7e", gray400: "#94a3b3", gray200: "#d4dde5", gray100: "#edf1f5",
  font: "'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif",
};

// ============================================================
// Componentes visuais
// ============================================================

function NetworkBg() {
  return (
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.07,pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="net" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.2" fill="#fff"/><circle cx="60" cy="30" r="1" fill="#fff"/>
          <circle cx="110" cy="15" r="1.4" fill="#fff"/><circle cx="35" cy="70" r="1" fill="#fff"/>
          <circle cx="85" cy="65" r="1.3" fill="#fff"/><circle cx="15" cy="110" r="1.1" fill="#fff"/>
          <circle cx="70" cy="100" r="1" fill="#fff"/><circle cx="105" cy="95" r="1.2" fill="#fff"/>
          <line x1="10" y1="10" x2="60" y2="30" stroke="#fff" strokeWidth="0.4"/>
          <line x1="60" y1="30" x2="110" y2="15" stroke="#fff" strokeWidth="0.3"/>
          <line x1="60" y1="30" x2="85" y2="65" stroke="#fff" strokeWidth="0.4"/>
          <line x1="10" y1="10" x2="35" y2="70" stroke="#fff" strokeWidth="0.3"/>
          <line x1="35" y1="70" x2="85" y2="65" stroke="#fff" strokeWidth="0.4"/>
          <line x1="85" y1="65" x2="105" y2="95" stroke="#fff" strokeWidth="0.3"/>
          <line x1="35" y1="70" x2="15" y2="110" stroke="#fff" strokeWidth="0.3"/>
          <line x1="15" y1="110" x2="70" y2="100" stroke="#fff" strokeWidth="0.4"/>
          <line x1="70" y1="100" x2="105" y2="95" stroke="#fff" strokeWidth="0.3"/>
          <line x1="85" y1="65" x2="110" y2="15" stroke="#fff" strokeWidth="0.25"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#net)"/>
    </svg>
  );
}

function WordCloud({ words }: { words: {word:string, count:number}[] }) {
  if (!words.length) return null;
  const maxCount = Math.max(...words.map(w => w.count), 1);
  const minCount = Math.min(...words.map(w => w.count), 1);
  const palette = [T.blue900, T.blue800, T.blue700, T.blue600, T.blue500, "#1b5e8a", "#1a7ab5", "#0e6699"];
  return (
    <div style={{
      display:"flex", flexWrap:"wrap", justifyContent:"center", alignItems:"center",
      gap:"6px 14px", padding:"32px 20px", minHeight:180,
    }}>
      {words.map((w) => {
        const ratio = maxCount === minCount ? 1 : (w.count - minCount) / (maxCount - minCount);
        const size = 13 + ratio * 34;
        const colorIdx = Math.floor(ratio * (palette.length - 1));
        return (
          <span key={w.word} style={{
            fontSize:size, color:palette[colorIdx],
            fontWeight: ratio > 0.6 ? 700 : ratio > 0.35 ? 600 : ratio > 0.15 ? 500 : 400,
            fontFamily:T.font, opacity:0.5 + ratio * 0.5,
            lineHeight:1.3, cursor:"default",
          }} title={`${w.word}: ${w.count} ocorrência${w.count > 1 ? "s" : ""}`}>{w.word}</span>
        );
      })}
    </div>
  );
}

function CustomTreemapCell(props: any) {
  const { x, y, width, height, name, value, index, colors } = props;
  if (width < 2 || height < 2) return null;
  const showLabel = width > 40 && height > 30;
  const showValue = width > 50 && height > 44;
  const fill = colors[index % colors.length];
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={3}
        fill={fill} stroke={T.white} strokeWidth={2} />
      {showLabel && (
        <text x={x + width/2} y={y + height/2 - (showValue ? 6 : 0)}
          textAnchor="middle" dominantBaseline="central"
          fill="#fff" fontSize={Math.min(13, width/6)} fontWeight={600}
          fontFamily={T.font} style={{pointerEvents:"none"}}>
          {name.length > width / 7 ? name.slice(0, Math.floor(width / 7)) + "…" : name}
        </text>
      )}
      {showValue && (
        <text x={x + width/2} y={y + height/2 + 12}
          textAnchor="middle" dominantBaseline="central"
          fill="rgba(255,255,255,0.8)" fontSize={11} fontWeight={400}
          fontFamily={T.font} style={{pointerEvents:"none"}}>
          {value}
        </text>
      )}
    </g>
  );
}

function TreemapTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background:T.blue900, color:T.white, padding:"8px 14px",
      borderRadius:6, fontSize:12, fontFamily:T.font,
      boxShadow:"0 4px 16px rgba(10,46,79,0.25)",
    }}>
      <div style={{fontWeight:600}}>{d.name}</div>
      <div style={{opacity:0.85}}>{d.value} resposta{d.value !== 1 ? "s" : ""}</div>
    </div>
  );
}

function HorizontalBars({ data, maxItems = 10 }: { data: {name:string,value:number}[], maxItems?: number }) {
  const display = data.slice(0, maxItems);
  const max = Math.max(...display.map(d => d.value), 1);
  return (
    <div style={{display:"flex", flexDirection:"column", gap:8}}>
      {display.map((d) => (
        <div key={d.name} style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{
            width:110, flexShrink:0, textAlign:"right",
            fontSize:12, color:T.blue900, fontWeight:500, fontFamily:T.font,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          }} title={d.name}>{d.name}</div>
          <div style={{flex:1, background:T.gray100, borderRadius:3, height:22, overflow:"hidden"}}>
            <div style={{
              width:`${(d.value / max) * 100}%`, height:"100%", borderRadius:3,
              background:`linear-gradient(90deg, ${T.blue700}, ${T.blue500})`,
              minWidth: d.value > 0 ? 4 : 0,
            }}/>
          </div>
          <div style={{
            width:32, textAlign:"right", fontSize:12, fontWeight:600,
            color:T.blue700, fontFamily:T.font, flexShrink:0,
          }}>{d.value}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// App principal
// ============================================================

export default function App() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("form");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [formacao, setFormacao] = useState("");
  const [profissao, setProfissao] = useState("");
  const [expectativas, setExpectativas] = useState("");

  // ---- Listener em tempo real (substitui getDocs) ----
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "apresentacoes"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        setEntries(data);
        setLoading(false);
      },
      (err) => {
        console.error("Erro no listener:", err);
        setLoading(false);
      }
    );
    // Limpa o listener quando o componente desmonta
    return () => unsubscribe();
  }, []);

  const alreadySubmitted = useMemo(() => {
    const n = nome.trim().toLowerCase();
    return n && entries.some(e => (e.nome || "").toLowerCase() === n);
  }, [nome, entries]);

  const handleSubmit = useCallback(async () => {
    if (!nome.trim()||!cidade.trim()||!estado||!formacao.trim()||!profissao.trim()||!expectativas.trim()) {
      setError("Preencha todos os campos."); return;
    }
    if (alreadySubmitted) { setError("Já existe uma resposta com esse nome."); return; }
    setError(""); setSubmitting(true);

    const entry = {
      nome: nome.trim(),
      cidade: cidade.trim(),
      estado,
      formacao: formacao.trim(),
      profissao: profissao.trim(),
      expectativas: expectativas.trim(),
      ts: Date.now()
    };

    try {
      await addDoc(collection(db, "apresentacoes"), entry);
      // Não precisa mais setar entries manualmente — o onSnapshot cuida disso
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar. Verifique sua conexão e tente novamente.");
    }
    setSubmitting(false);
  }, [nome,cidade,estado,formacao,profissao,expectativas,alreadySubmitted]);

  // ---- Dados derivados ----

  const stateData = useMemo(() => {
    const f: Record<string, number> = {};
    entries.forEach(e => { if (e.estado) f[e.estado] = (f[e.estado] || 0) + 1; });
    return Object.entries(f).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [entries]);

  const cityData = useMemo(() => {
    const f: Record<string, number> = {};
    entries.forEach(e => {
      if (e.cidade && e.estado) {
        const k = `${e.cidade.trim()}, ${e.estado}`;
        f[k] = (f[k] || 0) + 1;
      }
    });
    return Object.entries(f).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([name, value]) => ({ name, value }));
  }, [entries]);

  const formacaoData = useMemo(() => {
    const f: Record<string, number> = {};
    entries.forEach(e => {
      if (e.formacao) { const k = normalizeCategory(e.formacao); f[k] = (f[k] || 0) + 1; }
    });
    const sorted = Object.entries(f).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
    return aggregateWithOthers(sorted, 8);
  }, [entries]);

  const profissaoData = useMemo(() => {
    const f: Record<string, number> = {};
    entries.forEach(e => {
      if (e.profissao) { const k = normalizeCategory(e.profissao); f[k] = (f[k] || 0) + 1; }
    });
    const sorted = Object.entries(f).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
    return aggregateWithOthers(sorted, 8);
  }, [entries]);

  const wordCloudData = useMemo(() => generateWordCloud(entries.map(e => e.expectativas || "")), [entries]);

  const treemapColors = [T.blue900, T.blue800, T.blue700, T.blue600, T.blue500, T.blue400, "#1b5e8a", "#2a78a8", "#3a8fc0", "#4aa0d0", T.blue300, T.blue200];
  const pieColors = [T.blue900, T.blue700, T.blue500, T.blue400, T.blue300, "#3a7fb8", "#4a90c4", T.blue200];

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.gray100,fontFamily:T.font}}>
      <span style={{color:T.gray400,fontSize:14}}>Carregando dados...</span>
    </div>
  );

  const inputBase: React.CSSProperties = {
    width:"100%", padding:"10px 14px", fontSize:14, fontFamily:T.font,
    border:`1px solid ${T.gray200}`, borderRadius:4, outline:"none",
    background:T.white, color:T.blue900, boxSizing:"border-box",
  };

  return (
    <div style={{minHeight:"100vh", background:T.gray100, fontFamily:T.font}}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <header style={{
        background:`linear-gradient(135deg, ${T.blue900} 0%, ${T.blue700} 50%, ${T.blue600} 100%)`,
        padding:"36px 24px 32px", position:"relative", overflow:"hidden",
      }}>
        <NetworkBg/>
        <div style={{position:"relative", maxWidth:640, margin:"0 auto", textAlign:"center"}}>
          <img src="/painel/logo-ifb.png" alt="Logo IFB"
            style={{height:"70px",objectFit:"contain",display:"block",margin:"0 auto 24px auto"}}/>
          <h1 style={{fontSize:"clamp(20px, 4.5vw, 30px)", color:T.white, margin:0, fontWeight:700, lineHeight:1.25}}>
            Aplicações da Inteligência Artificial<br/>na Educação Profissional
          </h1>
          <p style={{color:T.blue200, fontSize:13, marginTop:10, fontWeight:400}}>
            Prof. Dr. Marcos Ramon Gomes Ferreira
          </p>
        </div>
      </header>

      {/* TABS */}
      <div style={{maxWidth:640, margin:"0 auto", display:"flex", borderBottom:`1px solid ${T.gray200}`, background:T.white}}>
        {[
          {id:"form", label:"Formulário"},
          {id:"dashboard", label:`Painel da turma${entries.length ? ` (${entries.length})` : ""}`},
        ].map(tab => (
          <button key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              flex:1, padding:"13px 16px", border:"none", background:"transparent",
              fontSize:13, fontWeight:view === tab.id ? 600 : 400, cursor:"pointer",
              fontFamily:T.font, color:view === tab.id ? T.blue700 : T.gray400,
              borderBottom:view === tab.id ? `2px solid ${T.blue700}` : "2px solid transparent",
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* MAIN */}
      <main style={{maxWidth:640, margin:"0 auto", padding:"0 0 48px"}}>

        {/* FORMULÁRIO */}
        {view === "form" && (
          <div style={{background:T.white, padding:"28px 24px"}}>
            {submitted ? (
              <div style={{textAlign:"center", padding:"40px 16px"}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:T.blue100,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke={T.blue700} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 style={{fontSize:18, fontWeight:600, color:T.blue900, margin:"0 0 8px"}}>Resposta registrada</h2>
                <p style={{color:T.gray600, fontSize:14, lineHeight:1.6, margin:"0 0 24px"}}>
                  Acesse o painel para ver o panorama da turma.
                </p>
                <button onClick={() => setView("dashboard")}
                  style={{background:T.blue700, color:T.white, border:"none", borderRadius:4, padding:"10px 28px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:T.font}}>
                  Ver painel
                </button>
              </div>
            ) : (
              <>
                <p style={{fontSize:13, color:T.gray600, margin:"0 0 24px", lineHeight:1.6}}>
                  Preencha os campos abaixo para se apresentar à turma. Seu nome serve apenas para controle interno e não será exibido nos resultados.
                </p>

                <div style={{marginBottom:20}}>
                  <label style={{display:"block",fontSize:12,fontWeight:600,color:T.blue900,marginBottom:5}}>Nome completo</label>
                  <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome completo" style={inputBase}
                    onFocus={e => (e.target.style.borderColor = T.blue600)} onBlur={e => (e.target.style.borderColor = T.gray200)}/>
                  {alreadySubmitted && <div style={{color:"#c0392b",fontSize:11,marginTop:4}}>Já existe uma resposta com esse nome.</div>}
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
                  <div>
                    <label style={{display:"block",fontSize:12,fontWeight:600,color:T.blue900,marginBottom:5}}>Cidade</label>
                    <input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Ex: Brasília" style={inputBase}
                      onFocus={e => (e.target.style.borderColor = T.blue600)} onBlur={e => (e.target.style.borderColor = T.gray200)}/>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:12,fontWeight:600,color:T.blue900,marginBottom:5}}>Estado</label>
                    <select value={estado} onChange={e => setEstado(e.target.value)} style={{...inputBase,cursor:"pointer",appearance:"auto"}}
                      onFocus={e => (e.target.style.borderColor = T.blue600)} onBlur={e => (e.target.style.borderColor = T.gray200)}>
                      <option value="">Selecione</option>
                      {BRAZILIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
                  <div>
                    <label style={{display:"block",fontSize:12,fontWeight:600,color:T.blue900,marginBottom:5}}>Área de formação</label>
                    <input value={formacao} onChange={e => setFormacao(e.target.value)} placeholder="Ex: Pedagogia" style={inputBase}
                      onFocus={e => (e.target.style.borderColor = T.blue600)} onBlur={e => (e.target.style.borderColor = T.gray200)}/>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:12,fontWeight:600,color:T.blue900,marginBottom:5}}>Profissão atual</label>
                    <input value={profissao} onChange={e => setProfissao(e.target.value)} placeholder="Ex: Professora" style={inputBase}
                      onFocus={e => (e.target.style.borderColor = T.blue600)} onBlur={e => (e.target.style.borderColor = T.gray200)}/>
                  </div>
                </div>

                <div style={{marginBottom:24}}>
                  <label style={{display:"block",fontSize:12,fontWeight:600,color:T.blue900,marginBottom:5}}>Expectativas em relação ao curso</label>
                  <textarea value={expectativas} onChange={e => setExpectativas(e.target.value)}
                    placeholder="Escreva livremente sobre o que espera deste curso, como pretende aplicar o que aprender..."
                    rows={4} style={{...inputBase,resize:"vertical",lineHeight:1.6}}
                    onFocus={e => (e.target.style.borderColor = T.blue600)} onBlur={e => (e.target.style.borderColor = T.gray200)}/>
                </div>

                {error && <div style={{color:"#c0392b",fontSize:12,marginBottom:14,padding:"8px 12px",background:"#fdf0ef",borderRadius:4}}>{error}</div>}

                <button onClick={handleSubmit} disabled={submitting || Boolean(alreadySubmitted)}
                  style={{
                    width:"100%", padding:"12px",
                    background:(submitting || alreadySubmitted) ? T.gray200 : T.blue700,
                    color:(submitting || alreadySubmitted) ? T.gray400 : T.white,
                    border:"none", borderRadius:4, fontSize:14, fontWeight:600,
                    cursor:(submitting || alreadySubmitted) ? "not-allowed" : "pointer",
                    fontFamily:T.font,
                  }}>
                  {submitting ? "Enviando..." : "Enviar"}
                </button>
              </>
            )}
          </div>
        )}

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div style={{background:T.white}}>
            {entries.length === 0 ? (
              <div style={{textAlign:"center",padding:"56px 24px",color:T.gray400}}>
                <p style={{fontSize:14}}>Nenhuma resposta registrada ainda.</p>
              </div>
            ) : (
              <>
                {/* Indicador de tempo real */}
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"center",
                  gap:6, padding:"10px 24px", borderBottom:`1px solid ${T.gray100}`,
                  background:T.blue50,
                }}>
                  <span style={{
                    width:7, height:7, borderRadius:"50%", background:"#27ae60",
                    display:"inline-block", animation:"pulse 2s infinite",
                  }}/>
                  <span style={{fontSize:11, color:T.gray600}}>Atualização em tempo real</span>
                  <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
                </div>

                {/* Resumo numérico */}
                <div style={{display:"flex",borderBottom:`1px solid ${T.gray100}`}}>
                  {[
                    {n:entries.length, label:"respostas"},
                    {n:new Set(entries.map(e => e.estado)).size, label:"estados"},
                    {n:new Set(entries.map(e => (e.profissao || "").toLowerCase())).size, label:"profissões"},
                  ].map((c, i) => (
                    <div key={i} style={{flex:1, padding:"20px 16px", textAlign:"center", borderRight:i < 2 ? `1px solid ${T.gray100}` : "none"}}>
                      <div style={{fontSize:28,fontWeight:700,color:T.blue700,lineHeight:1}}>{c.n}</div>
                      <div style={{fontSize:11,color:T.gray400,marginTop:4,letterSpacing:"0.04em",textTransform:"uppercase"}}>{c.label}</div>
                    </div>
                  ))}
                </div>

                {/* Estados — Treemap */}
                <section style={{padding:"28px 24px",borderBottom:`1px solid ${T.gray100}`}}>
                  <h3 style={{fontSize:13,fontWeight:600,color:T.blue900,margin:"0 0 4px"}}>Distribuição por estado</h3>
                  <p style={{fontSize:11,color:T.gray400,margin:"0 0 16px"}}>Área proporcional ao número de respostas</p>
                  <div style={{height:220}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <Treemap data={stateData} dataKey="value" nameKey="name" aspectRatio={4/3}
                        stroke={T.white}
                        content={<CustomTreemapCell x={0} y={0} width={0} height={0} name="" value={0} index={0} colors={treemapColors}/>}>
                        <Tooltip content={<TreemapTooltip/>}/>
                      </Treemap>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Cidades — Barras horizontais */}
                {cityData.length > 0 && (
                  <section style={{padding:"28px 24px",borderBottom:`1px solid ${T.gray100}`}}>
                    <h3 style={{fontSize:13,fontWeight:600,color:T.blue900,margin:"0 0 4px"}}>Cidades mais representadas</h3>
                    <p style={{fontSize:11,color:T.gray400,margin:"0 0 16px"}}>Top {Math.min(cityData.length, 15)}</p>
                    <HorizontalBars data={cityData} maxItems={15}/>
                  </section>
                )}

                {/* Formação e Profissão — Donuts */}
                <section style={{padding:"28px 24px",borderBottom:`1px solid ${T.gray100}`}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
                    <div>
                      <h3 style={{fontSize:13,fontWeight:600,color:T.blue900,margin:"0 0 12px"}}>Área de formação</h3>
                      <div style={{height:240}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={formacaoData} dataKey="value" nameKey="name" cx="50%" cy="48%" outerRadius={65} innerRadius={28}
                              paddingAngle={1} strokeWidth={0}
                              label={({name, percent}) => {
                                const pct = (percent * 100).toFixed(0);
                                const display = name.length > 12 ? name.slice(0, 11) + "…" : name;
                                return `${display} ${pct}%`;
                              }}
                              labelLine={{stroke:T.gray200,strokeWidth:1}} style={{fontSize:10,fontFamily:T.font}}>
                              {formacaoData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]}/>)}
                            </Pie>
                            <Tooltip/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <h3 style={{fontSize:13,fontWeight:600,color:T.blue900,margin:"0 0 12px"}}>Profissão</h3>
                      <div style={{height:240}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={profissaoData} dataKey="value" nameKey="name" cx="50%" cy="48%" outerRadius={65} innerRadius={28}
                              paddingAngle={1} strokeWidth={0}
                              label={({name, percent}) => {
                                const pct = (percent * 100).toFixed(0);
                                const display = name.length > 12 ? name.slice(0, 11) + "…" : name;
                                return `${display} ${pct}%`;
                              }}
                              labelLine={{stroke:T.gray200,strokeWidth:1}} style={{fontSize:10,fontFamily:T.font}}>
                              {profissaoData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]}/>)}
                            </Pie>
                            <Tooltip/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Nuvem de palavras */}
                {wordCloudData.length > 0 && (
                  <section style={{padding:"28px 24px",borderBottom:`1px solid ${T.gray100}`}}>
                    <h3 style={{fontSize:13,fontWeight:600,color:T.blue900,margin:"0 0 4px"}}>Expectativas da turma</h3>
                    <p style={{fontSize:11,color:T.gray400,margin:"0 0 12px"}}>Palavras mais frequentes nos textos de expectativa</p>
                    <WordCloud words={wordCloudData}/>
                  </section>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <footer style={{textAlign:"center",padding:"16px 24px 32px",color:T.gray400,fontSize:10,letterSpacing:"0.03em"}}>
        Aplicações da IA na Educação Profissional · IFB Campus Brasília
      </footer>
    </div>
  );
}
