"use client";

import { useParams } from "next/navigation";

import { CardDetailPage } from "@/components/board/card-detail";

export default function CardPage() {
  const params = useParams<{ workspaceId: string; boardId: string; cardId: string }>();

  return (
    <CardDetailPage
      workspaceId={params.workspaceId}
      boardId={params.boardId}
      cardId={params.cardId}
    /> 
  );
}

