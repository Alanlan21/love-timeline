"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, MapPin, Clock } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  location?: string;
}

interface PlannerProps {
  events: Event[];
  onAddEvent: (event: Omit<Event, "id">) => void;
  onDeleteEvent: (id: string) => void;
}

export default function Planner({
  events,
  onAddEvent,
  onDeleteEvent,
}: PlannerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    location: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date) {
      onAddEvent(newEvent);
      setNewEvent({
        title: "",
        date: "",
        time: "",
        description: "",
        location: "",
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-purple-900">Nossos Planos</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Evento
        </motion.button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-800 text-sm font-medium mb-2">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-purple-900 placeholder-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Ex: Jantar romântico"
                  required
                />
              </div>
              <div>
                <label className="block text-purple-800 text-sm font-medium mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-800 text-sm font-medium mb-2">
                  Horário
                </label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-purple-800 text-sm font-medium mb-2">
                  Local
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-purple-900 placeholder-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Ex: Restaurante XYZ"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-800 text-sm font-medium mb-2">
                Descrição
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-purple-900 placeholder-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                rows={3}
                placeholder="Detalhes sobre o evento..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-white/10 border border-white/20 text-purple-900 py-2 rounded-lg hover:bg-white/20"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600"
              >
                Adicionar Evento
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-6">
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <Calendar className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            <h3 className="text-2xl font-semibold text-purple-900 mb-2">
              Nenhum evento planejado
            </h3>
            <p className="text-lg text-purple-700">
              Adicione nosso primeiro evento especial! ✨
            </p>
          </motion.div>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-purple-700 text-sm font-medium">
                      {new Date(event.date).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-purple-900 mb-3">
                    {event.title}
                  </h3>

                  <div className="space-y-2">
                    {event.time && (
                      <div className="flex items-center gap-2 text-purple-700">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2 text-purple-700">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.description && (
                      <p className="text-purple-700 mt-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}


