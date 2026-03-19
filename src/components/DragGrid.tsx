import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function Tile({ id, children, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group"
    >
      {children}

      {/* remove button */}
      <button
        onClick={() => onRemove(id)}
        className="absolute top-1 right-1 hidden group-hover:block bg-red-600 text-xs px-2 rounded"
      >
        ✕
      </button>
    </div>
  );
}

export default function DragGrid({ videos, setVideos, rows, cols, onRemove }) {
  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = videos.findIndex((v) => v.id === active.id);
    const newIndex = videos.findIndex((v) => v.id === over.id);

    setVideos(arrayMove(videos, oldIndex, newIndex));
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={videos.map((v) => v.id)}
        strategy={rectSortingStrategy}
      >
        <div
          className="gap-1"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {videos.map((v) => (
            <Tile key={v.id} id={v.id} onRemove={onRemove}>
              <video
                src={v.url}
                className="w-full h-full object-cover rounded"
              />
            </Tile>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
