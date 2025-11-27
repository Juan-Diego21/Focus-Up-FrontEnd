/**
 * Historias de Storybook para MiniSessionCard
 *
 * Muestra la tarjeta de sesión minimizada con diferentes estados,
 * incluyendo cuando tiene música activa.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MiniSessionCard } from './MiniSessionCard';

const meta: Meta<typeof MiniSessionCard> = {
  title: 'Components/MiniSessionCard',
  component: MiniSessionCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tarjeta minimizada que muestra información compacta de la sesión activa.',
      },
    },
  },
  argTypes: {
    onMaximize: {
      action: 'maximized',
      description: 'Callback cuando se maximiza la tarjeta',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MiniSessionCard>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Estado por defecto de la tarjeta minimizada.',
      },
    },
  },
};

export const WithMusicActive: Story = {
  parameters: {
    docs: {
      description: {
        story: 'MiniSessionCard con música activa reproduciendo.',
      },
    },
  },
};

export const Expanded: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Tarjeta minimizada en estado expandido mostrando controles adicionales.',
      },
    },
  },
};

export const Paused: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Sesión pausada en tarjeta minimizada.',
      },
    },
  },
};