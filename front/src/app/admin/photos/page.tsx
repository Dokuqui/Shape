/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { deletePhoto, getEvents, getGalleryPhotosByEventId, uploadGalleryPhoto } from '@/lib/api';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 2rem;
  min-height: 100vh;
`;

const UploadBox = styled.div`
  margin-top: 1rem;
  background: #e8f4fe;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1rem;
`;

const SelectEvent = styled.select`
  width: 100%;
  padding: 0.8rem;
  margin: 1rem 0;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    background-color: #45a049;
  }
`;

const GalleryContainer = styled.div`
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const PhotoCard = styled.div`
  background-color: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  &:hover {
    background-color: red;
  }
`;

const Message = styled.p`
  margin-top: 1rem;
  color: #e74c3c;
`;

export default function GaleriePage() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [files, setFiles] = useState<FileList | null>(null);
    const [message, setMessage] = useState('');
    const [photos, setPhotos] = useState<any[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const eventsData = await getEvents();
                setEvents(eventsData);
            } catch (error) {
                console.error('Error fetching events:', error);
                setMessage('Erreur lors de la récupération des événements');
            }
        };
        fetchEvents();
    }, []);

    const handleUpload = async () => {
        if (!selectedEventId || !files?.length) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            try {
                await uploadGalleryPhoto(selectedEventId, file);
            } catch (error) {
                setMessage(`Erreur lors de l’upload: ${error}`);
                return;
            }
        }

        setMessage('Photos téléchargées avec succès !');
        setFiles(null);
        fetchPhotos();
    };

    const fetchPhotos = async () => {
        if (!selectedEventId) return;
        try {
            const data = await getGalleryPhotosByEventId(selectedEventId);
            setPhotos(data);
        } catch (error) {
            setMessage(`Erreur lors de la récupération des photos: ${error}`);
        }
    };

    const handleDeletePhoto = async (photoId: number) => {
        try {
            await deletePhoto(photoId);
            setMessage('Photo supprimée avec succès');
            fetchPhotos();
        } catch (error) {
            setMessage(`Erreur lors de la suppression de la photo: ${error}`);
        }
    };

    return (
        <PageContainer>
            <Title>Ajouter une galerie photo</Title>

            <label>Choisir un événement :</label>
            <SelectEvent onChange={(e) => setSelectedEventId(Number(e.target.value))} value={selectedEventId || ''}>
                <option value="">-- Sélectionner un événement --</option>
                {events.map((event) => (
                    <option key={event.id} value={event.id}>
                        {event.title}
                    </option>
                ))}
            </SelectEvent>

            <UploadBox>
                <label>Ajouter des photos :</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />
                <Button onClick={handleUpload}>Télécharger</Button>
                {message && <Message>{message}</Message>}
            </UploadBox>

            {photos.length > 0 && (
                <GalleryContainer>
                    {photos.map((photo) => (
                        <PhotoCard key={photo.id}>
                            <Image src={photo.file_url} alt={`Photo ${photo.id}`} />
                            <DeleteButton onClick={() => handleDeletePhoto(photo.id)}>X</DeleteButton>
                        </PhotoCard>
                    ))}
                </GalleryContainer>
            )}
        </PageContainer>
    );
}