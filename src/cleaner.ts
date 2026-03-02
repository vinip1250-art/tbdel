const TORBOX_API_KEY = process.env.TORBOX_API_KEY!;
const BASE_URL = "https://api.torbox.app/v1";
const STALL_MINUTES = Number(process.env.STALL_MINUTES ?? 30);

// Estados exatos retornados pela API do TorBox
const STUCK_STATES = [
  "stalled (no seeds)",   // travado sem seeds
  "checkingResumeData",   // verificando dados
  "checking",             // verificação genérica
  "metaDL",               // preso baixando metadata
  "stalledUP",            // travado no upload
];

interface Torrent {
  id: number;
  name: string;
  progress: number;       // float 0.0 a 1.0
  download_state: string;
  created_at: string;
}

async function fetchTorrents(): Promise<Torrent[]> {
  const res = await fetch(`${BASE_URL}/api/torrents/mylist?bypass_cache=true`, {
    headers: { Authorization: `Bearer ${TORBOX_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Erro ao listar: ${res.statusText}`);
  const json = await res.json();
  return json.data ?? [];
}

async function deleteTorrent(id: number, name: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/torrents/controltorrent`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TORBOX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ torrent_id: id, operation: "delete" }),
  });
  if (res.ok) {
    console.log(`[✓] Deletado: ${name} (id: ${id})`);
  } else {
    console.error(`[✗] Falha: ${name} — ${res.statusText}`);
  }
}

function isStuck(torrent: Torrent): boolean {
  const ageMinutes =
    (Date.now() - new Date(torrent.created_at).getTime()) / 1000 / 60;

  const stateMatch = STUCK_STATES.includes(torrent.download_state);
  const zeroProgress = torrent.progress < 0.01; // < 1%
  const oldEnough = ageMinutes >= STALL_MINUTES;

  return stateMatch && zeroProgress && oldEnough;
}

async function run(): Promise<void> {
  console.log(`
[${new Date().toISOString()}] Iniciando verificação...`);
  if (!TORBOX_API_KEY) { console.error("TORBOX_API_KEY não definida."); process.exit(1); }

  const torrents = await fetchTorrents();

  // Debug: mostra os estados únicos encontrados
  const states = [...new Set(torrents.map((t) => t.download_state))];
  console.log(`Estados encontrados: ${states.join(", ")}`);

  const stuck = torrents.filter(isStuck);
  console.log(`Total: ${torrents.length} | Travados: ${stuck.length}`);

  if (stuck.length === 0) { console.log("Nenhum download travado encontrado."); return; }

  for (const torrent of stuck) {
    console.log(`  → ${torrent.download_state} | ${(torrent.progress * 100).toFixed(1)}% | ${torrent.name}`);
    await deleteTorrent(torrent.id, torrent.name);
  }
}

run().catch(console.error);
