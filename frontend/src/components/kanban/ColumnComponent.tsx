'use client';

import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column, Task } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { Plus, MoreVertical, Trash2, Edit2, Check, X } from 'lucide-react';

interface ColumnComponentProps {
  column: Column;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onUpdateColumnTitle: (columnId: string, title: string) => Promise<void>;
  onDeleteColumn: (columnId: string) => Promise<void>;
}

export const ColumnComponent: React.FC<ColumnComponentProps> = ({
  column,
  onAddTask,
  onEditTask,
  onUpdateColumnTitle,
  onDeleteColumn,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(column.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleTitleSubmit = async () => {
    if (!titleInput.trim() || titleInput === column.title) {
      setIsEditingTitle(false);
      setTitleInput(column.title);
      return;
    }

    try {
      await onUpdateColumnTitle(column.id, titleInput.trim());
      setIsEditingTitle(false);
    } catch (err) {
      setTitleInput(column.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="w-80 flex-shrink-0 bg-slate-900/90 border border-slate-800 rounded-[6px] flex flex-col max-h-full overflow-hidden">
      {/* Column Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#F99B4F] flex-shrink-0" />

          {isEditingTitle ? (
            <div className="flex items-center space-x-1 flex-1">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="bg-slate-950 border border-slate-700 text-white text-sm font-semibold px-2 py-1 rounded-[6px] w-full focus:outline-none focus:ring-2 focus:ring-[#F99B4F]"
              />
              <button
                onClick={handleTitleSubmit}
                className="p-1 text-slate-300 hover:bg-slate-800 rounded-[6px]"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditingTitle(false);
                  setTitleInput(column.title);
                }}
                className="p-1 text-slate-400 hover:bg-slate-800 rounded-[6px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="text-base font-semibold text-white tracking-tight truncate cursor-pointer hover:text-[#F99B4F] transition-colors"
            >
              {column.title}
            </h3>
          )}

          <span className="bg-slate-800 text-[#F99B4F] text-xs px-2.5 py-0.5 rounded-full font-semibold border border-slate-700">
            {column.tasks.length}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-400 hover:text-white p-1.5 rounded-[6px] hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-slate-900 border border-slate-800 rounded-[6px] shadow-2xl py-1 z-30 w-36 text-slate-200">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsEditingTitle(true);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-800 flex items-center space-x-2"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Rename</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (confirm('Are you sure you want to delete this column and all its tasks?')) {
                    onDeleteColumn(column.id);
                  }
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 flex items-center space-x-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Column Tasks Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 flex-1 overflow-y-auto min-h-[150px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-slate-800/40' : ''
            }`}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEditTask={onEditTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Task Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <button
          onClick={() => onAddTask(column.id)}
          className="w-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-semibold text-xs py-2.5 rounded-[6px] transition-all flex items-center justify-center space-x-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#F99B4F]" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};
