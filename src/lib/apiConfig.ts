export const getApiUrl = () => {
  // Si estamos en un entorno donde el host es diferente al del backend de Cloud Run
  // y no estamos en localhost, apuntamos al backend de producción.
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'xpatagonia.online' || window.location.hostname.includes('xpatagonia')) {
      return 'https://ais-pre-kltvklhlaaloygkauddz7p-544534912623.us-east1.run.app';
    }
  }
  return '';
};
