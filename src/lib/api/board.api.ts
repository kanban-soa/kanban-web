import api from "./axios";
import { BOARDS, LISTS, CARDS, LABELS } from "./routes";
import type { Board, BoardList, Card, Label } from "./types";

// ── helpers ─────────────────────────────────────────────────────────────────
function unwrap<T>(payload: T | { data: T }): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>)
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

// Board service stores the column as `name` (legacy) but the UI consumes
// `title`. Normalise either shape into a single Board.
type RawBoard = Partial<Board> & { name?: string };

function normalizeBoard(raw: RawBoard): Board {
  return {
    ...(raw as Board),
    id: String(raw.id ?? raw.publicId ?? ""),
    publicId: String(raw.publicId ?? raw.id ?? ""),
    title: raw.title ?? raw.name ?? "",
    description: raw.description ?? null,
    workspaceId: String(raw.workspaceId ?? ""),
  };
}

export function normalizeLabel(raw: unknown): Label {
  if (!raw || typeof raw !== "object") {
    return { id: "", publicId: "", name: "", color: "#3b82f6", boardId: "" };
  }
  const row = raw as Record<string, unknown>;
  const nested =
    "label" in row && row.label && typeof row.label === "object"
      ? (row.label as Record<string, unknown>)
      : row;
  const id = String(nested.id ?? nested.publicId ?? "");
  return {
    id,
    publicId: String(nested.publicId ?? nested.id ?? id),
    name: String(nested.name ?? ""),
    color: String(
      nested.colourCode ?? nested.color ?? "#3b82f6",
    ),
    boardId: String(nested.boardId ?? ""),
  };
}

function normalizeCardLabels(raw: { labels?: unknown }): Label[] {
  if (!Array.isArray(raw.labels) || raw.labels.length === 0) {
    return [];
  }
  return raw.labels
    .map(normalizeLabel)
    .filter((label) => label.id.length > 0 && label.name.length > 0);
}

type RawCard = Partial<Card> & {
  name?: string;
  labels?: unknown;
  list?: { publicId?: string; name?: string };
};

function normalizeCard(raw: RawCard, listId?: string): Card {
  const id = String(raw.id ?? raw.publicId ?? "");
  const labels = normalizeCardLabels(raw);
  const resolvedListId = String(
    raw.listId ?? raw.list?.publicId ?? listId ?? "",
  );
  return {
    ...(raw as Card),
    id,
    publicId: String(raw.publicId ?? raw.id ?? id),
    title: raw.title ?? raw.name ?? "",
    description: raw.description ?? null,
    listId: resolvedListId,
    list: raw.list?.publicId
      ? { publicId: raw.list.publicId, name: raw.list.name ?? "" }
      : (raw as Card).list,
    labels,
    members: Array.isArray(raw.members)
      ? raw.members.map(String)
      : Array.isArray((raw as { assignedWorkspaceMemberPublicIds?: string[] }).assignedWorkspaceMemberPublicIds,)
        ? (raw as { assignedWorkspaceMemberPublicIds: string[] })
            .assignedWorkspaceMemberPublicIds
        : raw.members,
  };
}

// ── Boards ──────────────────────────────────────────────────────────────────
export async function listBoards(workspaceId: string): Promise<Board[]> {
  const { data } = await api.get<RawBoard[] | { data: RawBoard[] }>(
    BOARDS.LIST(workspaceId),
  );
  const items = unwrap<RawBoard[]>(data);
  return Array.isArray(items) ? items.map(normalizeBoard) : [];
}

export async function getBoard(
  workspaceId: string,
  boardId: string,
): Promise<Board> {
  const { data } = await api.get<RawBoard | { data: RawBoard }>(
    BOARDS.DETAIL(workspaceId, boardId),
  );
  return normalizeBoard(unwrap<RawBoard>(data));
}

export interface CreateBoardRequest {
  title: string;
  description?: string;
}

export async function createBoard(
  workspaceId: string,
  payload: CreateBoardRequest,
): Promise<Board> {
  const { data } = await api.post<RawBoard | { data: RawBoard }>(
    BOARDS.CREATE(workspaceId),
    payload,
  );
  return normalizeBoard(unwrap<RawBoard>(data));
}

export interface UpdateBoardRequest {
  title?: string;
  description?: string | null;
}

export async function updateBoard(
  workspaceId: string,
  boardId: string,
  payload: UpdateBoardRequest,
): Promise<Board> {
  const { data } = await api.patch<RawBoard | { data: RawBoard }>(
    BOARDS.UPDATE(workspaceId, boardId),
    payload,
  );
  return normalizeBoard(unwrap<RawBoard>(data));
}

export async function deleteBoard(
  workspaceId: string,
  boardId: string,
): Promise<void> {
  await api.delete(BOARDS.DELETE(workspaceId, boardId));
}

// ── Lists ───────────────────────────────────────────────────────────────────
type RawListWithCards = {
  id?: string | number;
  publicId?: string;
  name?: string;
  title?: string;
  index?: number;
  position?: number;
  boardId?: string | number;
  cards?: RawCard[];
};

function normalizeListRow(
  raw: RawListWithCards,
  boardId: string,
): BoardList & { cards: Card[] } {
  const listId = String(raw.publicId ?? raw.id ?? "");
  const cards = Array.isArray(raw.cards)
    ? raw.cards.map((card) => normalizeCard(card, listId))
    : [];

  return {
    id: listId,
    publicId: listId,
    name: raw.name ?? raw.title ?? "",
    position:
      typeof raw.index === "number"
        ? raw.index
        : typeof raw.position === "number"
          ? raw.position
          : 0,
    boardId: String(raw.boardId ?? boardId),
    cards,
  };
}

/** Board detail includes cards with labels (BoardMapper); prefer over lists-only API. */
async function fetchListsFromBoardDetail(
  workspaceId: string,
  boardId: string,
): Promise<(BoardList & { cards: Card[] })[]> {
  const { data } = await api.get<
    { lists?: RawListWithCards[]; allLists?: RawListWithCards[] } | {
      data: { lists?: RawListWithCards[]; allLists?: RawListWithCards[] };
    }
  >(BOARDS.DETAIL(workspaceId, boardId));
  const board = unwrap(data);
  const lists = board.lists ?? board.allLists;
  if (!Array.isArray(lists) || lists.length === 0) {
    return [];
  }
  return lists.map((list) => normalizeListRow(list, boardId));
}

async function enrichCardsWithLabels(cards: Card[]): Promise<Card[]> {
  return Promise.all(
    cards.map(async (card) => {
      if (card.labels && card.labels.length > 0) {
        return card;
      }
      const cardId = card.publicId ?? card.id;
      if (!cardId) {
        return { ...card, labels: [] };
      }
      try {
        const detailed = await getCard(cardId);
        return {
          ...card,
          ...detailed,
          labels: detailed.labels ?? [],
        };
      } catch {
        return { ...card, labels: [] };
      }
    }),
  );
}

async function fetchCardsForList(listId: string): Promise<Card[]> {
  try {
    const { data } = await api.get<RawCard[] | { data: RawCard[] }>(
      LISTS.CARDS(listId),
    );
    const items = unwrap<RawCard[]>(data);
    if (!Array.isArray(items)) return [];
    const cards = items.map((raw) => normalizeCard(raw, listId));
    return enrichCardsWithLabels(cards);
  } catch {
    // Endpoint may not be exposed yet on the server — fall back to empty.
    return [];
  }
}

async function fetchListsFromListsEndpoint(
  workspaceId: string,
  boardId: string,
): Promise<(BoardList & { cards: Card[] })[]> {
  const { data } = await api.get<
    RawListWithCards[] | { data: RawListWithCards[] }
  >(BOARDS.LISTS(workspaceId, boardId));
  const items = unwrap<RawListWithCards[]>(data);
  if (!Array.isArray(items)) return [];

  return Promise.all(
    items.map(async (l) => {
      const listId = String(l.publicId ?? l.id ?? "");
      const embedded = Array.isArray(l.cards) ? l.cards : null;
      let cards = embedded
        ? embedded.map((card) => normalizeCard(card, listId))
        : await fetchCardsForList(listId);

      const missingLabels = cards.some(
        (card) => !card.labels || card.labels.length === 0,
      );
      if (missingLabels) {
        cards = await enrichCardsWithLabels(cards);
      }

      return normalizeListRow({ ...l, cards }, boardId);
    }),
  );
}

export async function listBoardLists(
  workspaceId: string,
  boardId: string,
): Promise<(BoardList & { cards: Card[] })[]> {
  try {
    const fromDetail = await fetchListsFromBoardDetail(workspaceId, boardId);
    if (fromDetail.length > 0) {
      return fromDetail;
    }
  } catch {
    // Fall through to lists endpoint.
  }
  return fetchListsFromListsEndpoint(workspaceId, boardId);
}

export interface CreateListRequest {
  name: string;
  position?: number;
}

export async function createList(
  boardId: string,
  payload: CreateListRequest,
): Promise<BoardList> {
  const { data } = await api.post<BoardList | { data: BoardList }>(
    BOARDS.CREATE_LIST(boardId),
    payload,
  );
  return unwrap<BoardList>(data);
}

export interface UpdateListRequest {
  name?: string;
  position?: number;
}

export async function updateList(
  listId: string,
  payload: UpdateListRequest,
): Promise<BoardList> {
  const { data } = await api.patch<BoardList | { data: BoardList }>(
    LISTS.UPDATE(listId),
    payload,
  );
  return unwrap<BoardList>(data);
}

export async function deleteList(listId: string): Promise<void> {
  await api.delete(LISTS.DELETE(listId));
}

// ── Cards ───────────────────────────────────────────────────────────────────
export interface CreateCardRequest {
  title: string;
  description?: string;
}

export async function createCard(
  listId: string,
  payload: CreateCardRequest,
): Promise<Card> {
  const { data } = await api.post<RawCard | { data: RawCard }>(
    LISTS.CREATE_CARD(listId),
    payload,
  );
  return normalizeCard(unwrap<RawCard>(data));
}

export async function getCard(cardId: string): Promise<Card> {
  const { data } = await api.get<RawCard | { data: RawCard }>(
    CARDS.DETAIL(cardId),
  );
  return normalizeCard(unwrap<RawCard>(data));
}

export interface UpdateCardRequest {
  title?: string;
  description?: string | null;
}

export async function updateCard(
  cardId: string,
  payload: UpdateCardRequest,
): Promise<Card> {
  const { data } = await api.patch<RawCard | { data: RawCard }>(
    CARDS.UPDATE(cardId),
    payload,
  );
  return normalizeCard(unwrap<RawCard>(data));
}

export interface MoveCardRequest {
  targetListId: string;
  newIndex?: number;
}

export async function moveCard(
  cardId: string,
  payload: MoveCardRequest,
): Promise<Card> {
  const { data } = await api.patch<RawCard | { data: RawCard }>(
    CARDS.MOVE(cardId),
    payload,
  );
  return normalizeCard(unwrap<RawCard>(data));
}

export async function deleteCard(cardId: string): Promise<void> {
  await api.delete(CARDS.DELETE(cardId));
}

export async function attachLabelToCard(
  cardId: string,
  labelId: string,
): Promise<void> {
  await api.post(CARDS.ATTACH_LABEL(cardId), { labelId });
}

export async function detachLabelFromCard(
  cardId: string,
  labelId: string,
): Promise<void> {
  await api.delete(CARDS.DETACH_LABEL(cardId, labelId));
}

export async function setCardDueDate(
  cardId: string,
  dueDate: string,
): Promise<Card> {
  const { data } = await api.patch<Card | { data: Card }>(
    CARDS.SET_DUE_DATE(cardId),
    { dueDate },
  );
  return unwrap<Card>(data);
}

export async function clearCardDueDate(cardId: string): Promise<Card> {
  const { data } = await api.delete<Card | { data: Card }>(
    CARDS.CLEAR_DUE_DATE(cardId),
  );
  return unwrap<Card>(data);
}

export async function assignMemberToCard(
  cardId: string,
  workspaceMemberPublicId: string,
): Promise<void> {
  await api.post(CARDS.ASSIGN_MEMBER(cardId), { 'workspaceMemberPublicId': workspaceMemberPublicId });
}

export async function removeMemberFromCard(
  cardId: string,
  memberId: string,
): Promise<void> {
  console.log(`Removing member ${memberId} from card ${cardId}`)
  await api.delete(CARDS.REMOVE_MEMBER(cardId, memberId));
}

// ── Labels ──────────────────────────────────────────────────────────────────
export async function listBoardLabels(boardId: string): Promise<Label[]> {
  const { data } = await api.get<any[] | { data: any[] }>(
    LABELS.LIST(boardId),
  );
  const items = unwrap<any[]>(data);
  return Array.isArray(items) ? items.map(normalizeLabel) : [];
}

export interface CreateLabelRequest {
  name: string;
  colourCode: string;
}

export async function createLabel(
  boardId: string,
  payload: CreateLabelRequest,
): Promise<Label> {
  const { data } = await api.post<any | { data: any }>(
    LABELS.LIST(boardId),
    payload,
  );
  return normalizeLabel(unwrap<any>(data));
}

export interface UpdateLabelRequest {
  name?: string;
  color?: string;
}

export async function updateLabel(
  boardId: string,
  labelId: string,
  payload: UpdateLabelRequest,
): Promise<Label> {
  const body = {
    name: payload.name,
    colourCode: payload.color ?? undefined,
  };
  const { data } = await api.patch<any | { data: any }>(
    LABELS.UPDATE(boardId, labelId),
    body,
  );
  return normalizeLabel(unwrap<any>(data));
}

export async function deleteLabel(
  boardId: string,
  labelId: string,
): Promise<void> {
  await api.delete(LABELS.DELETE(boardId, labelId));
}


// ── Board statistics (for statistic-service consumption) ────────────────────
export async function getBoardMetrics<T = unknown>(): Promise<T> {
  const { data } = await api.get<T | { data: T }>(BOARDS.STAT_METRICS);
  return unwrap<T>(data);
}

export async function getBoardActivityStats<T = unknown>(): Promise<T> {
  const { data } = await api.get<T | { data: T }>(BOARDS.STAT_ACTIVITIES);
  return unwrap<T>(data);
}

export async function getBoardPriorityStats<T = unknown>(): Promise<T> {
  const { data } = await api.get<T | { data: T }>(BOARDS.STAT_PRIORITIES);
  return unwrap<T>(data);
}

export async function getBoardWorkloadStats<T = unknown>(): Promise<T> {
  const { data } = await api.get<T | { data: T }>(BOARDS.STAT_WORKLOADS);
  return unwrap<T>(data);
}
