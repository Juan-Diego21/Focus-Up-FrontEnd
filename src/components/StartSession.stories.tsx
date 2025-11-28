/**
 * Historias de Storybook para StartSession
 *
 * Muestra diferentes estados del componente StartSession,
 * incluyendo el estado con eventId prefill.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { StartSession } from '../pages/sessions/StartSession';

const meta: Meta<typeof StartSession> = {
  title: 'Pages/StartSession',
  component: StartSession,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Página para iniciar sesiones de concentración con opciones para método y música.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StartSession>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Estado por defecto de la página StartSession.',
      },
    },
  },
};

export const WithEventId: Story = {
  parameters: {
    docs: {
      description: {
        story: 'StartSession con eventId en la query string, simulando un deep link desde email.',
      },
    },
  },
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Estado de carga mientras se obtiene información del evento.',
      },
    },
  },
};