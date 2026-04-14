"use client";

import { useParams } from "next/navigation";

import { TaskDetailPage } from "@/components/board/task-detail";

export default function TaskPage() {
  const params = useParams<{ workspaceId: string; boardId: string; taskId: string }>();

  return (
    <TaskDetailPage
      workspaceId={params.workspaceId}
      boardId={params.boardId}
      taskId={params.taskId}
    />
  );
}

