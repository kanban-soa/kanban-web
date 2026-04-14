"use client";

import { useParams } from "next/navigation";

import { BoardView } from "@/components/board/board-view";

export default function BoardPage() {
  const params = useParams<{ workspaceId: string; boardId: string }>();

  return <BoardView workspaceId={params.workspaceId} boardId={params.boardId} />;
}