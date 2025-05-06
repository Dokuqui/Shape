'use client'

import styled from 'styled-components'

type Props = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    message: string
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`

const Modal = styled.div`
  background: #0F172BFF;
  padding: 2rem 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 400px;
  color: white;
  text-align: center;

  @media (max-width: 600px) {
    max-width: %;
  }
`

const Message = styled.p`
  margin-bottom: 1.5rem;
  font-size: 1rem;
`

const Buttons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: bold;
  border: none;
  background: ${({ variant }) =>
        variant === 'danger' ? '#dc2626' : '#334155'};
  color: white;
  &:hover {
    opacity: 0.9;
  }
`

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    message,
}: Props) {
    if (!isOpen) return null

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <Message>{message}</Message>
                <Buttons>
                    <Button onClick={onClose}>Annuler</Button>
                    <Button variant="danger" onClick={onConfirm}>
                        Supprimer
                    </Button>
                </Buttons>
            </Modal>
        </Overlay>
    )
}
