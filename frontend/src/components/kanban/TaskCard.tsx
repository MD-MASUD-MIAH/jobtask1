'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task } from '@/lib/types';
import { GripVertical, AlignLeft, User as UserIcon } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  onEditTask: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEditTask }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={() => onEditTask(task)}
          className={`bg-slate-900 border border-slate-800 rounded-[6px] p-4 mb-3 transition-all cursor-pointer text-slate-100 shadow-sm group ${
            snapshot.isDragging
              ? 'border-[#F99B4F] shadow-2xl scale-[1.02] bg-slate-900 z-50'
              : 'hover:border-slate-700'
          }`}
        >
          <div className="flex items-start gap-2">
            <div
              {...provided.dragHandleProps}
              className="text-slate-500 group-hover:text-slate-300 p-0.5 rounded cursor-grab active:cursor-grabbing hover:bg-slate-800 transition-colors mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white leading-snug mb-1 group-hover:text-[#F99B4F] transition-colors">
                {task.title}
              </h4>

              {task.description && (
                <p className="text-slate-400 text-xs line-clamp-2 mb-3 flex items-start gap-1 font-normal">
                  <AlignLeft className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-500" />
                  <span>{task.description}</span>
                </p>
              )}

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800 text-[11px] font-medium text-slate-400">
                {task.assignedTo ? (
                  <div className="flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full">
                    <div className="w-4 h-4 rounded-full bg-[#F99B4F] text-white flex items-center justify-center font-semibold text-[9px]">
                      {task.assignedTo.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-200 font-semibold truncate max-w-[100px]">
                      {task.assignedTo.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-500 italic font-normal">Unassigned</span>
                )}

                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(task.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
