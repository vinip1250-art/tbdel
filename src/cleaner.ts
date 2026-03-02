const TORBOX_API_KEY = process.env.TORBOX_API_KEY!;
const BASE_URL = "https://api.torbox.app/v1";
const STALL_MINUTES = Number(process.env.STALL_MINUTES ?? 30);

type TorrentState =
  | "stalledDL"
  | "checkingDL"
  | "downloading"
  | "uploading"
  | "paused"
  | "error"
  | string;

interface Torrent {
  id: number;
  name: string;
  progress: number;
  download_state: TorrentState;
  created_at: string;
  download_speed: number;
}

async function fetchTorrents(): Promise<Torrent[]> {
  const res = await fetch(`${BASE_URL}/api/torrents/mylist?bypass_cache=true`, {
    headers: { Authorization: `Bearer ${TORBOX_API_KEY}` },
  });

  if (!res.ok) throw new Error(`Erro ao listar torrents: ${res.statusText}`);
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
    console.error(`[✗] Falha ao deletar: ${name} — ${res.statusText}`);
  }
}

function isStuck(torrent: Torrent): boolean {
  const ageMinutes =
    (Date.now() - new Date(torrent.created_at).getTime()) / 1000 / 60;

  const stalledStates: TorrentState[] = ["stalledDL", "checkingDL", "error"];

  const isStalled = stalledStates.includes(torrent.download_state);
  const isZeroProgress = torrent.progress === 0;
  const isOldEnough = ageMinutes >= STALL_MINUTES;

  return isStalled && isZeroProgress && isOldEnough;
}

async function run(): Promise<void> {
  console.log(`\n[${new Date().toISOString()}] Iniciando verificação...`);

  if (!TORBOX_API_KEY) {
    console.error("TORBOX_API_KEY não definida.");
    process.exit(1);
  }

  const torrents = await fetchTorrents();
  const stuck = torrents.filter(isStuck);

  console.log(`Total: ${torrents.length} | Travados: ${stuck.length}`);

  if (stuck.length === 0) {
    console.log("Nenhum download travado encontrado.");
    return;
  }

  for (const torrent of stuck) {
    await deleteTorrent(torrent.id, torrent.name);
  }
}

run().catch(console.error);
