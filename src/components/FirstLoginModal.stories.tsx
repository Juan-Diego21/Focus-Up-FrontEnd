/**
 * Historias de Storybook para FirstLoginModal
 *
 * Muestra el modal que aparece después del primer inicio de sesión
 * para ofrecer completar la encuesta de perfil.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { FirstLoginModal } from './FirstLoginModal';

const meta: Meta<typeof FirstLoginModal> = {
  title: 'Components/FirstLoginModal',
  component: FirstLoginModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Modal que se muestra después del primer login exitoso para invitar al usuario a completar su perfil.',
      },
    },
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controla si el modal está abierto',
    },
    onAccept: {
      action: 'accepted',
      description: 'Callback cuando el usuario acepta completar el perfil',
    },
    onDecline: {
      action: 'declined',
      description: 'Callback cuando el usuario declina completar el perfil',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FirstLoginModal>;

export const Open: Story = {
  args: {
    isOpen: true,
    onAccept: () => console.log('Usuario aceptó completar perfil'),
    onDecline: () => console.log('Usuario declinó completar perfil'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal abierto mostrando la invitación para completar el perfil.',
      },
    },
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onAccept: () => console.log('Usuario aceptó completar perfil'),
    onDecline: () => console.log('Usuario declinó completar perfil'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal cerrado (no visible).',
      },
    },
  },
};