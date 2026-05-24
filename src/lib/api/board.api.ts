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

type RawCard = Partial<Card> & { name?: string };

function normalizeCard(raw: RawCard): Card {
  return {
    ...(raw as Card),
    id: String(raw.id ?? raw.publicId ?? ""),
    publicId: String(raw.publicId ?? raw.id ?? ""),
    title: raw.title ?? raw.name ?? "",
    description: raw.description ?? null,
    listId: String(raw.listId ?? ""),
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
export async function listBoardLists(
  workspaceId: string,
  boardId: string,
): Promise<BoardList[]> {
  const { data } = await api.get<BoardList[] | { data: BoardList[] }>(
    BOARDS.LISTS(workspaceId, boardId),
  );
  const items = unwrap<BoardList[]>(data);
  return Array.isArray(items) ? items : [];
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
  targetListId?: string;
  newIndex?: number;
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
  await api.post(CARDS.ASSIGN_MEMBER(cardId), { workspaceMemberPublicId });
}

export async function removeMemberFromCard(
  cardId: string,
  memberId: string,
): Promise<void> {
  await api.delete(CARDS.REMOVE_MEMBER(cardId, memberId));
}

// ── Labels ──────────────────────────────────────────────────────────────────
export async function listBoardLabels(boardId: string): Promise<Label[]> {
  const { data } = await api.get<Label[] | { data: Label[] }>(
    LABELS.LIST(boardId),
  );
  const items = unwrap<Label[]>(data);
  return Array.isArray(items) ? items : [];
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
  const { data } = await api.patch<Label | { data: Label }>(
    LABELS.UPDATE(boardId, labelId),
    payload,
  );
  return unwrap<Label>(data);
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
