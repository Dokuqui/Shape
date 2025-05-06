'use client';

import { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import Image from 'next/image';

interface EventFormData {
    title: string;
    description?: string;
    date?: string;
    location?: string;
    cover_image?: File | null;
    cover_image_url?: string | null;
}

interface EventModalFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: EventFormData) => Promise<void>;
    initialData?: EventFormData;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const Modal = styled.div`
  background: #0f172a;
  padding: 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  color: white;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: 1rem;
    border-radius: 0.75rem;
    max-width: 90%;
    max-height: 85vh;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;

  @media (max-width: 600px) {
    font-size: 1.25rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  background-color: #fff;
  color: #000;
  border: none;
  border-radius: 0.5rem;

  @media (max-width: 600px) {
    max-width: 95%;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  background-color: #fff;
  color: #000;
  border: none;
  border-radius: 0.5rem;
  min-height: 100px;

  @media (max-width: 600px) {
    max-width: 95%;
  }
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ variant?: 'secondary' | 'primary' }>`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: bold;
  border: none;
  background: ${({ variant }) => (variant === 'primary' ? '#1e40af' : '#334155')};
  color: white;
  &:hover {
    opacity: 0.9;
  }
`;

const PreviewContainer = styled.div`
  margin-top: 0.5rem;
`;

const PreviewLabel = styled.p`
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

export default function EventFormModal({ isOpen, onClose, onSubmit, initialData }: EventModalFormProps) {
    const [formData, setFormData] = useState<EventFormData>({
        title: '',
        description: '',
        date: '',
        location: '',
        cover_image: null,
        cover_image_url: null,
    });
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                date: initialData.date || '',
                location: initialData.location || '',
                cover_image: null,
                cover_image_url: initialData.cover_image_url || null,
            });
            setCoverImagePreview(initialData.cover_image_url || null);
        } else {
            setFormData({
                title: '',
                description: '',
                date: '',
                location: '',
                cover_image: null,
                cover_image_url: null,
            });
            setCoverImagePreview(null);
        }
    }, [initialData]);

    useEffect(() => {
        if (formData.cover_image) {
            const previewUrl = URL.createObjectURL(formData.cover_image);
            setCoverImagePreview(previewUrl);
            return () => URL.revokeObjectURL(previewUrl);
        } else if (formData.cover_image_url) {
            setCoverImagePreview(formData.cover_image_url);
        } else {
            setCoverImagePreview(null);
        }
    }, [formData.cover_image, formData.cover_image_url]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, cover_image: file, cover_image_url: null }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
            setFormData({
                title: '',
                description: '',
                date: '',
                location: '',
                cover_image: null,
                cover_image_url: formData.cover_image_url
            });
        } catch (err) {
            console.error('Form submission error:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <Title>{initialData ? 'Edit Event' : 'Create Event'}</Title>
                <form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Titre</Label>
                        <Input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </FormGroup>
                    <FormGroup>
                        <Label>Description</Label>
                        <Textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Date et Heure</Label>
                        <Input
                            type="datetime-local"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Lieu</Label>
                        <Input type="text" name="location" value={formData.location} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label>Affiche de l&apos;événement</Label>
                        <Input
                            type="file"
                            name="cover_image"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {coverImagePreview && (
                            <PreviewContainer>
                                <PreviewLabel>Aperçu :</PreviewLabel>
                                <Image
                                    src={coverImagePreview}
                                    alt="Preview affiche"
                                    width={500}
                                    height={200}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        objectFit: 'contain',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #475569',
                                    }}
                                />
                            </PreviewContainer>
                        )}
                    </FormGroup>
                    <Buttons>
                        <Button type="submit" variant="primary">
                            {initialData ? 'Enregistrer' : 'Créer'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Annuler
                        </Button>
                    </Buttons>
                </form>
            </Modal>
        </Overlay>
    );
}