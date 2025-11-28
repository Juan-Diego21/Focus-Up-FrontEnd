/**
 * Historias de Storybook para ConcentrationCard
 *
 * Muestra diferentes estados de la tarjeta de concentración:
 * activa, pausada, minimizada, completada.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ConcentrationCard } from './ConcentrationCard';

const meta: Meta<typeof ConcentrationCard> = {
  title: 'Components/ConcentrationCard',
  component: ConcentrationCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tarjeta que muestra la sesión de concentración activa con controles de pausa/reanudar.',
      },
    },
  },
  argTypes: {
    isVisible: {
      control: 'boolean',
      description: 'Controla si la tarjeta está visible',
    },
    onMinimize: {
      action: 'minimized',
      description: 'Callback cuando se minimiza la tarjeta',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConcentrationCard>;

export const Active: Story = {
  args: {
    isVisible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sesión activa corriendo con timer visible.',
      },
    },
  },
};

export const Paused: Story = {
  args: {
    isVisible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sesión pausada mostrando tiempo acumulado.',
      },
    },
  },
};

export const Minimized: Story = {
  args: {
    isVisible: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tarjeta minimizada (no visible).',
      },
    },
  },
};

export const Completed: Story = {
  args: {
    isVisible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sesión completada lista para finalizar.',
      },
    },
  },
};