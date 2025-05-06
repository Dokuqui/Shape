'use client';

import { useState, useEffect } from 'react';
import { createEvent, deleteEvent, getEvents, updateEvent } from '@/lib/api';
import ErrorMessage from '@/components/ErrorMessage';
import EventFormModal from '@/components/EventModalForm';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { styled } from 'styled-components';
import ConfirmModal from '@/components/DeleteConfirmModal';
import withAuth from '@/hoc/withAuth';

interface Event {
  id: number;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  cover_image_url?: string;
  photos: [];
}

interface EventFormData {
  title: string;
  description?: string;
  date?: string;
  location?: string;
  cover_image?: File | null;
  cover_image_url?: string | null;
}

const Container = styled.div`
  padding: 2rem;
  padding-bottom: 6rem;
  overflow-y: auto;
  max-height: 80vh;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 6rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
`;

const AddButton = styled.button`
  background: #1e40af;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  transition: 0.3s;
  &:hover {
    background: #2563eb;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Cover = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 0.75rem;
  margin-bottom: 1rem;`

const Card = styled.div`
  background: #0f172a;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: white;
`;

const CardDate = styled.p`
  font-size: 0.875rem;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: white;
  margin-bottom: 0.5rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const IconButton = styled.button`
  background: #1e293b;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: 0.2s;
  &:hover {
    background: #334155;
  }
`;

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  const fetchEvents = async () => {
    try {
      const fetchedEvents = await getEvents();
      setEvents(fetchedEvents);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (formData: EventFormData) => {
    try {
      interface EventPayload {
        title: string;
        description?: string;
        date?: string;
        location?: string;
        cover_image_url?: string | null;
      }

      const { cover_image, cover_image_url, ...eventData } = formData as EventFormData & { cover_image_url?: string | null };

      const eventFormData = new FormData();
      eventFormData.append('event', JSON.stringify(eventData));
      if (cover_image) {
        eventFormData.append('file', cover_image);
      } else if (cover_image_url) {
        (eventData as EventPayload).cover_image_url = cover_image_url;
        eventFormData.set('event', JSON.stringify(eventData));
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventFormData);
      } else {
        await createEvent(eventFormData);
      }

      await fetchEvents();
      setIsModalOpen(false);
      setEditingEvent(null);
      setError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(`Failed to ${editingEvent ? 'update' : 'create'} event: ${err.message}`);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const getInitialData = (event: Event | null): EventFormData | undefined => {
    if (!event) return undefined;
    return {
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      cover_image: null,
      cover_image_url: event.cover_image_url || null,
    };
  };

  const handleDeleteClick = (id: number) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (toDeleteId !== null) {
      try {
        await deleteEvent(toDeleteId);
        setEvents((prev) => prev.filter((e) => e.id !== toDeleteId));
        setError(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la suppression de l’événement');
      } finally {
        setToDeleteId(null);
        setConfirmOpen(false);
      }
    }
  };

  return (
    <Container>
      <Header>
        <Title>Gestion des événements</Title>
        <AddButton onClick={() => openCreateModal()}>
          <FaPlus /> Ajouter un événement
        </AddButton>
      </Header>
      {error && <ErrorMessage message={error} />}
      <Grid>
        {events.map((event) => (
          <Card key={event.id}>
            <CardTitle>{event.title}</CardTitle>
            {event.cover_image_url && (
              <Cover
                src={event.cover_image_url}
                alt={event.title}
                width={200}
                height={150}
                style={{ objectFit: 'cover' }}
              />
            )}
            <CardDescription>{event.description}</CardDescription>
            <CardDate>
              {event.date ? new Date(event.date).toLocaleString() : 'No date'}
            </CardDate>
            <Actions>
              <IconButton title="Modifier" onClick={() => openEditModal(event)}>
                <FaEdit />
              </IconButton>
              <IconButton title="Supprimer" onClick={() => handleDeleteClick(event.id!)}>
                <FaTrash />
              </IconButton>
            </Actions>
          </Card>
        ))}
      </Grid>
      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={getInitialData(editingEvent)}
      />
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        message="Es-tu sûr de vouloir supprimer cet événement ?"
      />
    </Container>
  );
}

export default withAuth(EventsPage);