/**
 * Hook personalizado para acceder al contexto de sesiones de concentración
 *
 * Este hook proporciona una interfaz conveniente para interactuar con el
 * estado global de sesiones de concentración. Debe usarse dentro de componentes
 * que estén envueltos por el ConcentrationSessionProvider.
 *
 * Proporciona acceso a todas las operaciones de sesión y estado actual.
 */

import { useConcentrationSession as useContextConcentrationSession } from '../providers/ConcentrationSessionProvider';

/**
 * Hook para usar el contexto de sesiones de concentración
 *
 * @returns API completa del contexto de sesiones
 */
export const useConcentrationSession = () => {
  return useContextConcentrationSession();
};

export default useConcentrationSession;